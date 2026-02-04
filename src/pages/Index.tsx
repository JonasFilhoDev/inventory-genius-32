import { Package, Boxes, Factory, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/ui/stat-card';
import { useProducts } from '@/hooks/useProducts';
import { useRawMaterials } from '@/hooks/useRawMaterials';
import { useProductionSuggestions } from '@/hooks/useProductionSuggestions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { data: products = [] } = useProducts();
  const { data: materials = [] } = useRawMaterials();
  const { data: productionData } = useProductionSuggestions();

  const lowStockMaterials = materials.filter(m => m.stock_quantity < 10);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do sistema de controle de estoque
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Produtos Cadastrados"
            value={products.length}
            icon={Package}
            variant="primary"
          />
          <StatCard
            title="Matérias-Primas"
            value={materials.length}
            icon={Boxes}
            variant="default"
          />
          <StatCard
            title="Produção Sugerida"
            value={productionData?.totalProducts || 0}
            icon={Factory}
            description="unidades possíveis"
            variant="success"
          />
          <StatCard
            title="Valor Total Estimado"
            value={formatCurrency(productionData?.totalValue || 0)}
            icon={DollarSign}
            variant="success"
          />
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Production Suggestions */}
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-success" />
                  Sugestões de Produção
                </CardTitle>
                <CardDescription>
                  Produtos priorizados por maior valor
                </CardDescription>
              </div>
              <Link to="/production">
                <Button variant="outline" size="sm">Ver Todas</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {productionData?.suggestions && productionData.suggestions.length > 0 ? (
                <div className="space-y-3">
                  {productionData.suggestions.slice(0, 5).map((suggestion) => (
                    <div
                      key={suggestion.product.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{suggestion.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {suggestion.max_quantity} unidades
                        </p>
                      </div>
                      <Badge variant="secondary" className="font-mono">
                        {formatCurrency(suggestion.total_value)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma sugestão de produção disponível.
                  <br />
                  <span className="text-sm">Cadastre produtos e matérias-primas para começar.</span>
                </p>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Estoque Baixo
              </CardTitle>
              <CardDescription>
                Matérias-primas com estoque abaixo de 10 unidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockMaterials.length > 0 ? (
                <div className="space-y-3">
                  {lowStockMaterials.map((material) => (
                    <div
                      key={material.id}
                      className="flex items-center justify-between rounded-lg border border-warning/30 bg-warning/5 p-3"
                    >
                      <div>
                        <p className="font-medium">{material.name}</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {material.code}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-warning/20 text-warning-foreground border-warning/50">
                        {material.stock_quantity.toFixed(3)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma matéria-prima com estoque baixo.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link to="/products">
                <Button>
                  <Package className="mr-2 h-4 w-4" />
                  Gerenciar Produtos
                </Button>
              </Link>
              <Link to="/materials">
                <Button variant="outline">
                  <Boxes className="mr-2 h-4 w-4" />
                  Gerenciar Matérias-Primas
                </Button>
              </Link>
              <Link to="/production">
                <Button variant="outline">
                  <Factory className="mr-2 h-4 w-4" />
                  Ver Produção
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;
