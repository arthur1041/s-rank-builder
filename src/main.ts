import readline from 'readline';
import CacheProvider from './cache.provider';
import { FundService } from './funds.service';
import { FundInterface } from './interfaces';

import { CompleteFundType } from './types';
import {
  delay,
  generateJSONFile,
  generateXlsxFile,
  getMean,
  getMedian,
  sortFunds
} from './util';

const cacheProvider = new CacheProvider();
const fundService = new FundService(cacheProvider);

async function fetchFiiData() {
  try {
    const nonce = await fundService.getNonce();

    let funds = await fundService.getFunds(nonce);

    console.log(`Total de fundos encontrados: ${funds.length}`);

    // Eliminando fundos com menos de R$ 200 mil negociados diariamente
    funds = funds.filter(
      (el: FundInterface) => Number(el.liquidezmediadiaria) >= 200000
    );

    // Removendo FIIs de certos setores
    funds = funds.filter(
      (el: FundInterface) =>
        el.setor_slug &&
        el.setor_slug !== 'indefinido' &&
        el.setor_slug !== 'educacional' &&
        el.setor_slug !== 'fundo-de-desenvolvimento' &&
        el.setor_slug !== 'imoveis-residenciais' &&
        el.setor_slug !== 'hoteis' &&
        el.setor_slug !== 'imoveis-comerciais-outros' &&
        el.setor_slug !== 'outros'
    );

    console.log(`Total de fundos após filtros: ${funds.length}`);

    // Buscando dividendos pagos dos últimos 12 meses
    let completeFunds: CompleteFundType[] = [];

    for (let i = 0; i < funds.length; i++) {
      const fund = funds[i];
      const dividends = await fundService.getDividends(fund.ticker, nonce);
      const dividendsValues = dividends.map((el) => Number(el.yeld));

      const completeFund: CompleteFundType = {
        ...fund,
        dividendos: dividends,
        dyMedia: getMean(dividendsValues),
        dyMediana: getMedian(dividendsValues)
      };

      completeFunds.push(completeFund);
      console.log(
        `Fundo: ${fund.ticker}, Número de dividendos: ${dividends.length}`
      );

      // Delay para evitar sobrecarga no servidor
      const nextFund = funds[i + 1];
      if (nextFund && !fundService.areDividendsCached(nextFund.ticker)) {
        await delay(3000);
      }
    }

    // Eliminando FIIs com menos de 1 ano de idade
    completeFunds = completeFunds.filter((el) => el.dividendos!.length >= 12);

    // Filtrando FIIs com discrepância baixa entre média e mediana de DY
    console.log(
      `Total de fundos antes da análise de discrepância: ${completeFunds.length}`
    );
    completeFunds = completeFunds.filter((el) => {
      const discrepancy =
        Math.abs((el.dyMedia! - el.dyMediana!) / el.dyMediana!) * 100;
      return discrepancy <= 20;
    });
    console.log(
      `Total de fundos após análise de discrepância: ${completeFunds.length}`
    );

    // Ordenando por P/VPA
    completeFunds = completeFunds.filter((el) => el.p_vpa);
    completeFunds = sortFunds(completeFunds, 'p_vpa', true);
    completeFunds = completeFunds.map((el, index) => ({
      ...el,
      pVPA_ranking: index + 1
    }));

    // Ordenando por mediana DY
    completeFunds = completeFunds.filter((el) => el.dyMediana);
    completeFunds = sortFunds(completeFunds, 'dyMediana', false);
    completeFunds = completeFunds.map((el, index) => ({
      ...el,
      mediana_ranking: index + 1
    }));

    // Compondo ranking final (S-Rank)
    completeFunds = completeFunds.map((el) => ({
      ...el,
      sRank_ranking: el.pVPA_ranking! + el.mediana_ranking!
    }));
    completeFunds = sortFunds(completeFunds, 'sRank_ranking', true);

    console.log('----- FUNDOS COM SUAS MÉDIAS E MEDIANAS DE DY -----');
    completeFunds.forEach((el) => {
      console.log(
        `Fundo: ${el.ticker}, Média DY: ${el.dyMedia}, Mediana DY: ${el.dyMediana}, Média pré-calculada: ${el.media_yield_12m}`
      );
    });

    // Removendo dividendos do objeto final para salvar
    completeFunds.forEach((el) => {
      delete el.dividendos;
    });

    const mappedFunds = completeFunds.map((el: CompleteFundType) => ({
      'Ranking S-Rank': el.sRank_ranking,
      Ticker: el.ticker,
      Valor: el.valor,
      'P/VPA': el.p_vpa,
      'Liquidez Média Diária': el.liquidezmediadiaria,
      'Média DY 12M': el.dyMedia,
      'Mediana DY 12M': el.dyMediana,
      'Ranking P/VPA': el.pVPA_ranking,
      'Ranking Mediana': el.mediana_ranking
    }));

    const now = new Date().toISOString().replace(/:/g, '_');
    generateJSONFile(mappedFunds, `fundos-srank-${now}.json`);
    generateXlsxFile(mappedFunds, `fundos-srank-${now}.xlsx`);

    console.log('Arquivos JSON e XLSX gerados com sucesso.');
  } catch (error) {
    console.error('Erro ao buscar os dados dos FIIs:', error);
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const actions: Record<
  string,
  (() => void) | (() => Promise<void>) | undefined
> = {
  '1': fetchFiiData,
  '2': cacheProvider.clearAll.bind(cacheProvider),
  '0': () => {
    console.log('Saindo...');
    rl.close();
  }
};

const promptUser = () =>
  rl.question(
    'Digite uma opção (1 - Buscar fundos, 2 - Limpar Cache, 0 - Sair): ',
    async (input: string) => {
      const sanitizedInput = input.trim();

      const action = actions[sanitizedInput];

      if (action) {
        try {
          await action();
        } catch (error) {
          console.error('Erro durante a execução:', error);
        }
        if (sanitizedInput !== '0') {
          promptUser();
        }
      } else {
        console.log('Opção inválida. Tente novamente.');
        promptUser();
      }
    }
  );

promptUser();
