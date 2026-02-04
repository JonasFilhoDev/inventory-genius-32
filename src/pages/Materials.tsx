import { useState } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useRawMaterials, useCreateRawMaterial, useUpdateRawMaterial, useDeleteRawMaterial } from '@/hooks/useRawMaterials';
import { MaterialForm } from '@/components/materials/MaterialForm';
import { RawMaterial } from '@/types/database';

export default function Materials() {
  const { data: materials = [], isLoading } = useRawMaterials();
  const createMaterial = useCreateRawMaterial();
  const updateMaterial = useUpdateRawMaterial();
  const deleteMaterial = useDeleteRawMaterial();

  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);
  const [deletingMaterial, setDeletingMaterial] = useState<RawMaterial | null>(null);

  const filteredMaterials = materials.filter(
    m => m.name.toLowerCase().includes(search.toLowerCase()) ||
         m.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (data: Omit<RawMaterial, 'id' | 'created_at' | 'updated_at'>) => {
    createMaterial.mutate(data, {
      onSuccess: () => setIsFormOpen(false),
    });
  };

  const handleUpdate = (data: Omit<RawMaterial, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingMaterial) return;
    updateMaterial.mutate({ id: editingMaterial.id, ...data }, {
      onSuccess: () => setEditingMaterial(null),
    });
  };

  const handleDelete = () => {
    if (!deletingMaterial) return;
    deleteMaterial.mutate(deletingMaterial.id, {
      onSuccess: () => setDeletingMaterial(null),
    });
  };

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) {
      return <Badge variant="destructive">Sem Estoque</Badge>;
    }
    if (quantity < 10) {
      return <Badge className="bg-warning/20 text-warning-foreground border-warning/50">Baixo</Badge>;
    }
    return <Badge variant="secondary">Normal</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Matérias-Primas</h1>
            <p className="text-muted-foreground">
              Gerencie o estoque de matérias-primas
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Matéria-Prima
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar matérias-primas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="table-header-gradient">
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="text-right">Quantidade em Estoque</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredMaterials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {search ? 'Nenhuma matéria-prima encontrada.' : 'Nenhuma matéria-prima cadastrada.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMaterials.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="font-mono text-sm">{material.code}</TableCell>
                    <TableCell className="font-medium">{material.name}</TableCell>
                    <TableCell className="text-right font-mono">
                      {material.stock_quantity.toFixed(3)}
                    </TableCell>
                    <TableCell>{getStockBadge(material.stock_quantity)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditingMaterial(material)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setDeletingMaterial(material)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Matéria-Prima</DialogTitle>
          </DialogHeader>
          <MaterialForm
            onSubmit={handleCreate}
            onCancel={() => setIsFormOpen(false)}
            isLoading={createMaterial.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingMaterial} onOpenChange={() => setEditingMaterial(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Matéria-Prima</DialogTitle>
          </DialogHeader>
          {editingMaterial && (
            <MaterialForm
              material={editingMaterial}
              onSubmit={handleUpdate}
              onCancel={() => setEditingMaterial(null)}
              isLoading={updateMaterial.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingMaterial} onOpenChange={() => setDeletingMaterial(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Matéria-Prima</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a matéria-prima "{deletingMaterial?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
