import pool from './db';

export async function updateTransactionInfo(id:number,fee:string,actionType:string,actionText:string): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const updateQuery = `
      UPDATE messages
      SET fee = $1,
        action_type = $2,
        action_detail = $3
      WHERE id = $4     
    `;
    await client.query(updateQuery, [fee, actionType,actionText,id]);

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating transaction:', err);
    throw err;
  } finally {
    client.release();
  }
}
