import { runStatement, runQuery } from '../connection.js';

export const addThicknessToInventory = async () => {
  try {
    // Check if column already exists
    const checkColumnSql = `SELECT COUNT(*) as count FROM pragma_table_info('inventory_items') WHERE name = 'thickness'`;
    const result = await runQuery(checkColumnSql);

    // Only add the column if it doesn't exist
    if (result[0].count === 0) {
      console.log('Adding thickness column to inventory_items table...');
      await runStatement('ALTER TABLE inventory_items ADD COLUMN thickness REAL DEFAULT 0');
      console.log('Successfully added thickness column to inventory_items table');
    } else {
      console.log('thickness column already exists in inventory_items table');
    }
  } catch (error) {
    // If the column already exists, SQLite will throw an error, which we can safely ignore
    if (error.message && error.message.includes('duplicate column name')) {
      console.log('thickness column already exists in inventory_items table (caught duplicate column error)');
    } else {
      console.error('Error adding thickness column:', error);
      throw error;
    }
  }
};