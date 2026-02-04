export interface Product {
  id: string;
  code: string;
  name: string;
  value: number;
  created_at: string;
  updated_at: string;
}

export interface RawMaterial {
  id: string;
  code: string;
  name: string;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface ProductMaterial {
  id: string;
  product_id: string;
  raw_material_id: string;
  quantity_needed: number;
  created_at: string;
  raw_material?: RawMaterial;
}

export interface ProductWithMaterials extends Product {
  product_materials: ProductMaterial[];
}

export interface ProductionSuggestion {
  product: Product;
  max_quantity: number;
  total_value: number;
  limiting_materials: {
    material: RawMaterial;
    available: number;
    needed_per_unit: number;
  }[];
}
