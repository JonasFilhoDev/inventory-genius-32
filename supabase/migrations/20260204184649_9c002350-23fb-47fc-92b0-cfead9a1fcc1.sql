-- Create products table
CREATE TABLE public.products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create raw_materials table
CREATE TABLE public.raw_materials (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    stock_quantity DECIMAL(10, 3) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_materials junction table (association between products and raw materials)
CREATE TABLE public.product_materials (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    raw_material_id UUID NOT NULL REFERENCES public.raw_materials(id) ON DELETE CASCADE,
    quantity_needed DECIMAL(10, 3) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(product_id, raw_material_id)
);

-- Enable Row Level Security (public access for this system)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_materials ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required for this industrial system)
CREATE POLICY "Allow public read access on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Allow public read access on raw_materials" ON public.raw_materials FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on raw_materials" ON public.raw_materials FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on raw_materials" ON public.raw_materials FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on raw_materials" ON public.raw_materials FOR DELETE USING (true);

CREATE POLICY "Allow public read access on product_materials" ON public.product_materials FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on product_materials" ON public.product_materials FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on product_materials" ON public.product_materials FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on product_materials" ON public.product_materials FOR DELETE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_raw_materials_updated_at
    BEFORE UPDATE ON public.raw_materials
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();