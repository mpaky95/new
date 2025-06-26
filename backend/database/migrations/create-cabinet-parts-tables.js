import { runStatement } from '../connection.js';

export const createCabinetPartsTables = async () => {
  const sql = `
    /*
      # Create Cabinet Parts System for Parametric Design

      1. New Tables
        - \`cabinet_parts\` - Defines generic cabinet part types
        - \`cabinet_model_parts\` - Links cabinet models to parts with parametric formulas
        - \`cabinet_part_materials\` - Defines which materials can be used for which parts
      
      2. Features
        - Parametric design with formula-based dimensions
        - Material compatibility for different part types
        - Edge banding configuration
        - Support for custom formulas per cabinet model
    */

    -- Cabinet Parts table - defines generic part types
    CREATE TABLE IF NOT EXISTS cabinet_parts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      part_type TEXT NOT NULL CHECK (part_type IN ('panel', 'door', 'drawer_front', 'drawer_box', 'shelf', 'back_panel')),
      default_formula_width TEXT,
      default_formula_height TEXT,
      default_formula_depth TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Cabinet Model Parts table - links cabinet models to parts with parametric formulas
    CREATE TABLE IF NOT EXISTS cabinet_model_parts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cabinet_model_id INTEGER NOT NULL,
      cabinet_part_id INTEGER NOT NULL,
      formula_width TEXT NOT NULL,
      formula_height TEXT NOT NULL,
      formula_depth TEXT,
      edge_banding_config TEXT, -- JSON array indicating which edges are banded (e.g., ["top", "bottom", "left", "right"])
      is_required BOOLEAN DEFAULT 1,
      quantity INTEGER DEFAULT 1,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cabinet_model_id) REFERENCES cabinet_models(id) ON DELETE CASCADE,
      FOREIGN KEY (cabinet_part_id) REFERENCES cabinet_parts(id) ON DELETE CASCADE,
      UNIQUE(cabinet_model_id, cabinet_part_id)
    );

    -- Cabinet Part Materials table - defines which materials can be used for which parts
    CREATE TABLE IF NOT EXISTS cabinet_part_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cabinet_part_id INTEGER NOT NULL,
      material_item_id INTEGER NOT NULL,
      is_default BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cabinet_part_id) REFERENCES cabinet_parts(id) ON DELETE CASCADE,
      FOREIGN KEY (material_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
      UNIQUE(cabinet_part_id, material_item_id)
    );

    -- Insert default cabinet parts
    INSERT OR IGNORE INTO cabinet_parts (name, description, part_type, default_formula_width, default_formula_height, default_formula_depth) VALUES 
    ('Top Panel', 'Top horizontal panel of the cabinet', 'panel', 'W - 2*T', 'D', 'T'),
    ('Bottom Panel', 'Bottom horizontal panel of the cabinet', 'panel', 'W - 2*T', 'D', 'T'),
    ('Side Panel - Left', 'Left vertical side panel', 'panel', 'D', 'H', 'T'),
    ('Side Panel - Right', 'Right vertical side panel', 'panel', 'D', 'H', 'T'),
    ('Back Panel', 'Rear panel of the cabinet', 'back_panel', 'W - 2*T', 'H - 2*T', 'T_back'),
    ('Door - Single', 'Single door for cabinet front', 'door', 'W', 'H', 'T_door'),
    ('Door - Left', 'Left door for double door cabinet', 'door', 'W/2 - 0.5', 'H', 'T_door'),
    ('Door - Right', 'Right door for double door cabinet', 'door', 'W/2 - 0.5', 'H', 'T_door'),
    ('Drawer Front', 'Front face of drawer', 'drawer_front', 'W', 'H_drawer', 'T_door'),
    ('Drawer Side - Left', 'Left side of drawer box', 'drawer_box', 'D_drawer - 2*T', 'H_drawer - T', 'T'),
    ('Drawer Side - Right', 'Right side of drawer box', 'drawer_box', 'D_drawer - 2*T', 'H_drawer - T', 'T'),
    ('Drawer Back', 'Back panel of drawer box', 'drawer_box', 'W - 2*T', 'H_drawer - T', 'T'),
    ('Drawer Bottom', 'Bottom panel of drawer box', 'drawer_box', 'W - 2*T', 'D_drawer - 2*T', 'T_bottom'),
    ('Shelf', 'Adjustable or fixed shelf', 'shelf', 'W - 2*T - 0.125', 'D - 0.5', 'T');

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_cabinet_model_parts_model ON cabinet_model_parts(cabinet_model_id);
    CREATE INDEX IF NOT EXISTS idx_cabinet_model_parts_part ON cabinet_model_parts(cabinet_part_id);
    CREATE INDEX IF NOT EXISTS idx_cabinet_part_materials_part ON cabinet_part_materials(cabinet_part_id);
    CREATE INDEX IF NOT EXISTS idx_cabinet_part_materials_material ON cabinet_part_materials(material_item_id);
  `;

  const statements = sql.split(';').filter(stmt => stmt.trim());
  for (const statement of statements) {
    if (statement.trim()) {
      await runStatement(statement.trim());
    }
  }
};