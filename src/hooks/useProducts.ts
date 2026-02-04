import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductWithMaterials } from '@/types/database';
import { toast } from 'sonner';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useProductWithMaterials(productId: string | undefined) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) return null;
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_materials (
            *,
            raw_materials (*)
          )
        `)
        .eq('id', productId)
        .single();
      
      if (error) throw error;
      
      return {
        ...data,
        product_materials: data.product_materials.map((pm: any) => ({
          ...pm,
          raw_material: pm.raw_materials,
        })),
      } as ProductWithMaterials;
    },
    enabled: !!productId,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar produto: ${error.message}`);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...product }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar produto: ${error.message}`);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto excluído com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir produto: ${error.message}`);
    },
  });
}
