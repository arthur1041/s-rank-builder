import * as fs from 'fs';
import * as XLSX from 'xlsx';
import * as path from 'path';

import { DividendInterface } from './interfaces';
import { CompleteFundType } from './types';

export function sortFunds(
  fundsArr: CompleteFundType[],
  field: 'p_vpa' | 'dyMediana' | 'sRank_ranking',
  asc = true
): CompleteFundType[] {
  return [...fundsArr].sort((a, b) =>
    asc ? a[field]! - b[field]! : b[field]! - a[field]!
  );
}

export function sortDividendsArray(
  dividends: DividendInterface[]
): DividendInterface[] {
  return dividends.sort((a, b) => {
    const [monthA, yearA] = a.referencia.split('/').map(Number);
    const [monthB, yearB] = b.referencia.split('/').map(Number);
    return yearA === yearB ? monthB - monthA : yearB - yearA;
  });
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getMedian(arr: number[]): number | undefined {
  if (!arr || arr.length === 0) {
    console.warn('getMedian called with an empty array');
    return undefined;
  }
  const sortedArr = [...arr].sort((a, b) => b - a);
  const mid = Math.floor(sortedArr.length / 2);
  return sortedArr.length % 2 === 0
    ? (sortedArr[mid - 1] + sortedArr[mid]) / 2
    : sortedArr[mid];
}

export function getMean(arr: number[]): number | undefined {
  if (!arr || arr.length === 0) {
    console.warn('getMean called with an empty array');
    return undefined;
  }
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

const BASE_DIR = path.resolve(__dirname, '../files');

const ensureFilesDirectory = (dirName: string): string => {
  const dir = path.join(BASE_DIR, dirName);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

export function generateJSONFile(data: object, filename: string): void {
  try {
    const dir = ensureFilesDirectory('');
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Arquivo ${filename} foi gerado com sucesso.`);
  } catch (error) {
    console.error('Erro ao gerar o arquivo JSON: ', error);
  }
}

export function generateXlsxFile(
  data: Record<string, any>[],
  filename: string
): void {
  try {
    const dir = ensureFilesDirectory('');
    const filePath = path.join(dir, filename);

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, filePath);

    console.log(`Arquivo ${filename} gerado com sucesso.`);
  } catch (error) {
    console.error('Erro ao gerar o arquivo XLSX:', error);
  }
}
