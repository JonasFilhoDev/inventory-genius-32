import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductionSuggestion, Product, RawMaterial } from '@/types/database';

export function useProductionSuggestions() {
  return useQuery({
    queryKey: ['production-suggestions'],
    queryFn: async () => {
      // Fetch all products with their materials
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          product_materials (
            *,
            raw_materials (*)
          )
        `)
        .order('value', { ascending: false });
      
      if (productsError) throw productsError;

      // Fetch current stock levels
      const { data: materials, error: materialsError } = await supabase
        .from('raw_materials')
        .select('*');
      
      if (materialsError) throw materialsError;

      // Create a map of material stock
      const stockMap = new Map<string, number>();
      materials.forEach((m: RawMaterial) => {
        stockMap.set(m.id, m.stock_quantity);
      });

      // Track consumed materials
      const consumedMaterials = new Map<string, number>();

      const suggestions: ProductionSuggestion[] = [];

      // Process products by value (already ordered by value desc)
      for (const product of products) {
        const productMaterials = product.product_materials || [];
        
        if (productMaterials.length === 0) continue;

        // Calculate max quantity that can be produced
        let maxQuantity = Infinity;
        const limitingMaterials: ProductionSuggestion['limiting_materials'] = [];

        for (const pm of productMaterials) {
          const materialId = pm.raw_material_id;
          const currentStock = stockMap.get(materialId) || 0;
          const consumed = consumedMaterials.get(materialId) || 0;
          const available = currentStock - consumed;
          const possibleUnits = Math.floor(available / pm.quantity_needed);
          
          if (possibleUnits < maxQuantity) {
            maxQuantity = possibleUnits;
          }

          limitingMaterials.push({
            material: pm.raw_materials as RawMaterial,
            available,
            needed_per_unit: pm.quantity_needed,
          });
        }

        if (maxQuantity > 0 && maxQuantity !== Infinity) {
          // Update consumed materials
          for (const pm of productMaterials) {
            const materialId = pm.raw_material_id;
            const currentConsumed = consumedMaterials.get(materialId) || 0;
            consumedMaterials.set(materialId, currentConsumed + (pm.quantity_needed * maxQuantity));
          }

          suggestions.push({
            product: {
              id: product.id,
              code: product.code,
              name: product.name,
              value: product.value,
              created_at: product.created_at,
              updated_at: product.updated_at,
            },
            max_quantity: maxQuantity,
            total_value: maxQuantity * product.value,
            limiting_materials: limitingMaterials.sort((a, b) => 
              (a.available / a.needed_per_unit) - (b.available / b.needed_per_unit)
            ),
          });
        }
      }

      const totalValue = suggestions.reduce((sum, s) => sum + s.total_value, 0);
      const totalProducts = suggestions.reduce((sum, s) => sum + s.max_quantity, 0);

      return {
        suggestions,
        totalValue,
        totalProducts,
      };
    },
  });
}
