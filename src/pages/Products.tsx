import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, ChevronRight } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useProductWithMaterials } from '@/hooks/useProducts';
import { ProductForm } from '@/components/products/ProductForm';
import { ProductMaterialsManager } from '@/components/products/ProductMaterialsManager';
import { Product } from '@/types/database';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export default function Products() {
  const { data: products = [], isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const { data: selectedProduct } = useProductWithMaterials(selectedProductId || undefined);

  const filteredProducts = products.filter(
    p => p.name.toLowerCase().includes(search.toLowerCase()) ||
         p.code.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleCreate = (data: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    createProduct.mutate(data, {
      onSuccess: () => setIsFormOpen(false),
    });
  };

  const handleUpdate = (data: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    if (!editingProduct) return;
    updateProduct.mutate({ id: editingProduct.id, ...data }, {
      onSuccess: () => setEditingProduct(null),
    });
  };

  const handleDelete = () => {
    if (!deletingProduct) return;
    deleteProduct.mutate(deletingProduct.id, {
      onSuccess: () => setDeletingProduct(null),
    });
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
            <p className="text-muted-foreground">
              Gerencie os produtos e suas composições
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
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
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-32"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {search ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow 
                    key={product.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedProductId(product.id)}
                  >
                    <TableCell className="font-mono text-sm">{product.code}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(product.value)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingProduct(product);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingProduct(product);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProductId(product.id);
                          }}
                        >
                          <ChevronRight className="h-4 w-4" />
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
            <DialogTitle>Novo Produto</DialogTitle>
          </DialogHeader>
          <ProductForm
            onSubmit={handleCreate}
            onCancel={() => setIsFormOpen(false)}
            isLoading={createProduct.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              product={editingProduct}
              onSubmit={handleUpdate}
              onCancel={() => setEditingProduct(null)}
              isLoading={updateProduct.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Produto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto "{deletingProduct?.name}"?
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

      {/* Product Details Sheet */}
      <Sheet open={!!selectedProductId} onOpenChange={() => setSelectedProductId(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {selectedProduct?.name || 'Carregando...'}
            </SheetTitle>
          </SheetHeader>
          
          {selectedProduct && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Código</p>
                  <p className="font-mono font-medium">{selectedProduct.code}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="font-mono font-medium">
                    {formatCurrency(selectedProduct.value)}
                  </p>
                </div>
              </div>

              <ProductMaterialsManager
                productId={selectedProduct.id}
                materials={selectedProduct.product_materials}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Layout>
  );
}
