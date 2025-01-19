import { DividendInterface, FundInterface } from './interfaces';

export type CompleteFundType = FundInterface & {
  dividendos?: DividendInterface[];
  dyMedia?: number;
  dyMediana?: number;
  pVPA_ranking?: number;
  mediana_ranking?: number;
  sRank_ranking?: number;
};
