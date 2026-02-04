import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ProductMaterial } from '@/types/database';
import { toast } from 'sonner';

export function useAddProductMaterial() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { product_id: string; raw_material_id: string; quantity_needed: number }) => {
      const { data: result, error } = await supabase
        .from('product_materials')
        .insert(data)
        .select(`
          *,
          raw_materials (*)
        `)
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', variables.product_id] });
      queryClient.invalidateQueries({ queryKey: ['production-suggestions'] });
      toast.success('Matéria-prima associada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao associar matéria-prima: ${error.message}`);
    },
  });
}

export function useUpdateProductMaterial() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, quantity_needed, product_id }: { id: string; quantity_needed: number; product_id: string }) => {
      const { data, error } = await supabase
        .from('product_materials')
        .update({ quantity_needed })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { ...data, product_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product', data.product_id] });
      queryClient.invalidateQueries({ queryKey: ['production-suggestions'] });
      toast.success('Quantidade atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar quantidade: ${error.message}`);
    },
  });
}

export function useRemoveProductMaterial() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, product_id }: { id: string; product_id: string }) => {
      const { error } = await supabase
        .from('product_materials')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { product_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['product', data.product_id] });
      queryClient.invalidateQueries({ queryKey: ['production-suggestions'] });
      toast.success('Matéria-prima removida do produto!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover matéria-prima: ${error.message}`);
    },
  });
}
