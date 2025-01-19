import axios from 'axios';
import { DividendInterface, FundInterface } from './interfaces';
import { sortDividendsArray } from './util';
import CacheProvider from './cache.provider';

export class FundService {
  private cacheService: CacheProvider;
  private baseUrl: string = 'https://www.fundsexplorer.com.br';

  constructor(cacheService: CacheProvider) {
    this.cacheService = cacheService;
  }

  /**
   * Obtém o nonce necessário para autenticação. Usa cache para evitar chamadas repetidas.
   * @returns O nonce obtido.
   */
  public async getNonce(): Promise<string> {
    const cacheKey = 'nonce';
    const cachedData = this.cacheService.getCache<{ nonce: string }>(cacheKey);

    if (cachedData) {
      console.log('Nonce recuperado do cache.');
      return cachedData.nonce;
    }

    const url = `${this.baseUrl}/wp-content/themes/fundsexplorer/dist/frontend.min.js`;
    const response = await axios.get(url);
    const jsContent: string = response.data;

    const nonceMatch = jsContent.match(
      /["']x-funds-nonce["']\s*:\s*["']([a-f0-9]+)["']/
    );

    if (!nonceMatch) {
      console.warn('Nonce não encontrado no arquivo JS.');
      return '';
    }

    console.log('Nonce extraído do arquivo JS.');
    const data = { nonce: nonceMatch[1] };

    this.cacheService.setCache({
      key: cacheKey,
      value: data,
      ttlInSeconds: 3600
    });

    return data.nonce;
  }

  /**
   * Obtém os fundos usando o nonce.
   * @param nonce Token de autenticação.
   * @returns Lista de fundos.
   */
  public async getFunds(nonce: string): Promise<FundInterface[]> {
    const cacheKey = 'funds';
    const cachedFunds = this.cacheService.getCache<FundInterface[]>(cacheKey);

    if (cachedFunds) {
      console.log('Fundos recuperados do cache.');
      return cachedFunds;
    }

    const url = `${this.baseUrl}/wp-json/funds/v1/get-ranking`;
    const config = {
      url,
      method: 'get',
      maxBodyLength: Infinity,
      headers: { 'x-funds-nonce': nonce }
    };

    const response = await axios.request(config);

    try {
      const funds = JSON.parse(response.data);
      this.cacheService.setCache({
        key: cacheKey,
        value: funds,
        ttlInSeconds: 3600 * 5
      });
      return funds;
    } catch (error) {
      console.error('Erro ao processar os dados dos fundos:', error);
      throw new Error('Falha ao processar os dados dos fundos.');
    }
  }

  /**
   * Obtém os dividendos de um fundo específico.
   * @param fundName Nome do fundo.
   * @param nonce Token de autenticação.
   * @returns Lista de dividendos.
   */
  public async getDividends(
    fundName: string,
    nonce: string
  ): Promise<DividendInterface[]> {
    const cacheKey = `dividends_${fundName}`;
    const cachedDividends =
      this.cacheService.getCache<DividendInterface[]>(cacheKey);

    if (cachedDividends) {
      console.log(`Dividendos do fundo ${fundName} recuperados do cache.`);
      return cachedDividends;
    }

    const url = `${this.baseUrl}/wp-json/funds/v1/dividends-by-period?mes=-1&ano=0&ticker=${fundName}`;
    const config = {
      url,
      method: 'get',
      maxBodyLength: Infinity,
      headers: { 'x-funds-nonce': nonce }
    };

    const response = await axios.request(config);

    try {
      const dividends: DividendInterface[] = JSON.parse(response.data);
      const filteredDividends = dividends.filter(
        (el) => el.tipo === 'Rendimento' && el.setor
      );
      const sortedDividends = sortDividendsArray(filteredDividends);
      const slicedDividends = sortedDividends.slice(0, 12);

      this.cacheService.setCache({
        key: cacheKey,
        value: slicedDividends,
        ttlInSeconds: 3600 * 5
      });
      return slicedDividends;
    } catch (error) {
      console.error(
        `Erro ao processar os dividendos do fundo ${fundName}:`,
        error
      );
      throw new Error(`Falha ao processar os dividendos do fundo ${fundName}.`);
    }
  }

  /**
   * Verifica se os dividendos de um fundo estão cacheados.
   * @param fundName Nome do fundo.
   * @returns `true` se os dividendos estiverem cacheados, `false` caso contrário.
   */
  public areDividendsCached(fundName: string): boolean {
    const cacheKey = `dividends_${fundName}`;
    return !!this.cacheService.getCache<DividendInterface[]>(cacheKey);
  }
}
