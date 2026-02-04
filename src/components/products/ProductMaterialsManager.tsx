import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { useAddProductMaterial, useUpdateProductMaterial, useRemoveProductMaterial } from '@/hooks/useProductMaterials';
import { ProductMaterial } from '@/types/database';

interface ProductMaterialsManagerProps {
  productId: string;
  materials: ProductMaterial[];
}

export function ProductMaterialsManager({ productId, materials }: ProductMaterialsManagerProps) {
  const { data: rawMaterials = [] } = useRawMaterials();
  const addMaterial = useAddProductMaterial();
  const updateMaterial = useUpdateProductMaterial();
  const removeMaterial = useRemoveProductMaterial();

  const [isAdding, setIsAdding] = useState(false);
  const [newMaterialId, setNewMaterialId] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState('');

  const availableMaterials = rawMaterials.filter(
    m => !materials.some(pm => pm.raw_material_id === m.id)
  );

  const handleAdd = () => {
    if (!newMaterialId || !newQuantity) return;
    
    addMaterial.mutate({
      product_id: productId,
      raw_material_id: newMaterialId,
      quantity_needed: parseFloat(newQuantity),
    }, {
      onSuccess: () => {
        setIsAdding(false);
        setNewMaterialId('');
        setNewQuantity('');
      },
    });
  };

  const handleUpdate = (id: string) => {
    if (!editQuantity) return;
    
    updateMaterial.mutate({
      id,
      quantity_needed: parseFloat(editQuantity),
      product_id: productId,
    }, {
      onSuccess: () => {
        setEditingId(null);
        setEditQuantity('');
      },
    });
  };

  const handleRemove = (id: string) => {
    removeMaterial.mutate({ id, product_id: productId });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Matérias-Primas</h3>
        {!isAdding && availableMaterials.length > 0 && (
          <Button size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Adicionar
          </Button>
        )}
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="table-header-gradient">
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">Quantidade Necessária</TableHead>
              <TableHead className="text-right">Estoque Disponível</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials.map((pm) => (
              <TableRow key={pm.id}>
                <TableCell className="font-mono text-sm">{pm.raw_material?.code}</TableCell>
                <TableCell>{pm.raw_material?.name}</TableCell>
                <TableCell className="text-right">
                  {editingId === pm.id ? (
                    <Input
                      type="number"
                      step="0.001"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(e.target.value)}
                      className="w-24 ml-auto"
                    />
                  ) : (
                    pm.quantity_needed.toFixed(3)
                  )}
                </TableCell>
                <TableCell className="text-right">{pm.raw_material?.stock_quantity.toFixed(3)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    {editingId === pm.id ? (
                      <>
                        <Button size="icon" variant="ghost" onClick={() => handleUpdate(pm.id)}>
                          <Check className="h-4 w-4 text-success" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => {
                            setEditingId(pm.id);
                            setEditQuantity(pm.quantity_needed.toString());
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => handleRemove(pm.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            
            {isAdding && (
              <TableRow>
                <TableCell colSpan={2}>
                  <Select value={newMaterialId} onValueChange={setNewMaterialId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma matéria-prima" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMaterials.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.code} - {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.001"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    placeholder="Qtd"
                    className="w-24 ml-auto"
                  />
                </TableCell>
                <TableCell></TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={handleAdd} disabled={addMaterial.isPending}>
                      <Check className="h-4 w-4 text-success" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setIsAdding(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
            
            {materials.length === 0 && !isAdding && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhuma matéria-prima associada a este produto.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
