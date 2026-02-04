import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { RawMaterial } from '@/types/database';
import { toast } from 'sonner';

export function useRawMaterials() {
  return useQuery({
    queryKey: ['raw_materials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('raw_materials')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as RawMaterial[];
    },
  });
}

export function useCreateRawMaterial() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (material: Omit<RawMaterial, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('raw_materials')
        .insert(material)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raw_materials'] });
      toast.success('Matéria-prima criada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar matéria-prima: ${error.message}`);
    },
  });
}

export function useUpdateRawMaterial() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...material }: Partial<RawMaterial> & { id: string }) => {
      const { data, error } = await supabase
        .from('raw_materials')
        .update(material)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raw_materials'] });
      toast.success('Matéria-prima atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar matéria-prima: ${error.message}`);
    },
  });
}

export function useDeleteRawMaterial() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('raw_materials')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['raw_materials'] });
      toast.success('Matéria-prima excluída com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir matéria-prima: ${error.message}`);
    },
  });
}
