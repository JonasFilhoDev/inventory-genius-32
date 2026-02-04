import { Factory, TrendingUp, DollarSign, Package, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useProductionSuggestions } from '@/hooks/useProductionSuggestions';

export default function Production() {
  const { data: productionData, isLoading } = useProductionSuggestions();

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
          <h1 className="text-3xl font-bold tracking-tight">Sugestões de Produção</h1>
          <p className="text-muted-foreground">
            Produtos que podem ser produzidos com o estoque atual, priorizados por maior valor
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            title="Total de Produtos"
            value={productionData?.suggestions.length || 0}
            icon={Package}
            description="tipos diferentes"
            variant="primary"
          />
          <StatCard
            title="Unidades Possíveis"
            value={productionData?.totalProducts || 0}
            icon={Factory}
            description="unidades totais"
            variant="success"
          />
          <StatCard
            title="Valor Total Estimado"
            value={formatCurrency(productionData?.totalValue || 0)}
            icon={DollarSign}
            description="receita potencial"
            variant="success"
          />
        </div>

        {/* Production Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Detalhamento da Produção
            </CardTitle>
            <CardDescription>
              Lista detalhada dos produtos sugeridos para produção, ordenados por valor
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Calculando sugestões de produção...
              </div>
            ) : productionData?.suggestions && productionData.suggestions.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-2">
                {productionData.suggestions.map((suggestion, index) => (
                  <AccordionItem 
                    key={suggestion.product.id} 
                    value={suggestion.product.id}
                    className="border rounded-lg px-4"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-4 flex-1 text-left">
                        <Badge variant="outline" className="font-mono">
                          #{index + 1}
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium">{suggestion.product.name}</p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {suggestion.product.code}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-success">
                            {formatCurrency(suggestion.total_value)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {suggestion.max_quantity} unidades × {formatCurrency(suggestion.product.value)}
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-4 pb-2 space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            Matérias-primas utilizadas
                          </h4>
                          <div className="rounded-lg border overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow className="table-header-gradient">
                                  <TableHead>Matéria-Prima</TableHead>
                                  <TableHead className="text-right">Necessário/Un.</TableHead>
                                  <TableHead className="text-right">Total Necessário</TableHead>
                                  <TableHead className="text-right">Disponível</TableHead>
                                  <TableHead className="w-32">Utilização</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {suggestion.limiting_materials.map((lm) => {
                                  const totalNeeded = lm.needed_per_unit * suggestion.max_quantity;
                                  const utilizationPercent = Math.min(100, (totalNeeded / lm.available) * 100);
                                  
                                  return (
                                    <TableRow key={lm.material.id}>
                                      <TableCell>
                                        <div>
                                          <p className="font-medium">{lm.material.name}</p>
                                          <p className="text-xs text-muted-foreground font-mono">
                                            {lm.material.code}
                                          </p>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-right font-mono">
                                        {lm.needed_per_unit.toFixed(3)}
                                      </TableCell>
                                      <TableCell className="text-right font-mono">
                                        {totalNeeded.toFixed(3)}
                                      </TableCell>
                                      <TableCell className="text-right font-mono">
                                        {lm.available.toFixed(3)}
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          <Progress 
                                            value={utilizationPercent} 
                                            className="h-2"
                                          />
                                          <span className="text-xs text-muted-foreground w-10">
                                            {utilizationPercent.toFixed(0)}%
                                          </span>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-12">
                <Factory className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma sugestão de produção</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Para calcular sugestões de produção, é necessário ter produtos cadastrados 
                  com matérias-primas associadas e estoque disponível.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
