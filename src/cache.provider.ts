import Database from 'better-sqlite3';

class CacheProvider {
  private db: Database.Database;

  constructor() {
    // Inicializa o banco de dados SQLite
    this.db = new Database('./data/cache.db');
    this.setup();
  }

  /**
   * Configura a tabela de cache no banco de dados.
   */
  private setup(): void {
    this.db
      .prepare(
        `
      CREATE TABLE IF NOT EXISTS cache (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        ttl INTEGER NOT NULL
      )
    `
      )
      .run();
  }

  /**
   * Armazena um valor no cache com tempo de expiração.
   * @param key Chave única para o cache.
   * @param value Valor a ser armazenado.
   * @param ttlInSeconds Tempo de vida em segundos.
   */
  public setCache({
    key,
    value,
    ttlInSeconds
  }: {
    key: string;
    value: any;
    ttlInSeconds: number;
  }): void {
    const createdAt = Date.now();
    const ttl = ttlInSeconds * 1000; // Milissegundos

    this.db
      .prepare(
        `
      INSERT INTO cache (key, value, created_at, ttl)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        created_at = excluded.created_at,
        ttl = excluded.ttl
    `
      )
      .run(key, JSON.stringify(value), createdAt, ttl);
  }

  /**
   * Recupera um valor do cache se ainda válido. Remove entradas expiradas automaticamente.
   * @param key Chave do cache.
   * @returns O valor armazenado ou `null` se expirado/inexistente.
   */
  public getCache<T>(key: string): T | null {
    const row: any = this.db
      .prepare(
        `
      SELECT value, created_at, ttl FROM cache WHERE key = ?
    `
      )
      .get(key);

    if (!row) {
      return null;
    }

    const { value, created_at, ttl } = row;
    if (Date.now() > created_at + ttl) {
      this.db.prepare('DELETE FROM cache WHERE key = ?').run(key);
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(
        `Erro ao parsear JSON do cache para a chave: ${key}`,
        error
      );
      return null;
    }
  }

  /**
   * Remove todas as entradas expiradas do cache.
   */
  public cleanExpiredCache(): void {
    this.db
      .prepare(
        `
      DELETE FROM cache WHERE created_at + ttl <= ?
    `
      )
      .run(Date.now());
  }

  /**
   * Remove todas as entradas do cache.
   */
  public clearAll(): void {
    this.db.prepare('DELETE FROM cache').run();
    console.log('Cache cleared.');
  }
}

export default CacheProvider;
