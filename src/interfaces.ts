export interface FundInterface {
  ano: string;
  ativos: string;
  cotacao_fechamento: string;
  dividendo: string;
  liquidezmediadiaria: string;
  media_yield_3m: string;
  media_yield_6m: string;
  media_yield_12m: string;
  numero_cotista: string;
  p_vpa: number;
  patrimonio: string;
  pl: string;
  post_id: string;
  post_title: string;
  pvp: string;
  rentabilidade: string;
  rentabilidade_mes: string;
  setor: string;
  setor_slug: string;
  soma_yield_3m: string;
  soma_yield_6m: string;
  soma_yield_12m: string;
  soma_yield_ano_corrente: string;
  ticker: string;
  tx_admin: string;
  tx_gestao: string;
  tx_performance: string;
  valor: string;
  variacao_cotacao_mes: string;
  volatility: string;
  vpa: string;
  vpa_change: string;
  vpa_rent: string;
  vpa_rent_m: string;
  vpa_yield: string;
  yeld: string;
  yield_vpa_3m: string;
  yield_vpa_3m_sum: string;
  yield_vpa_6m: string;
  yield_vpa_6m_sum: string;
  yield_vpa_12m: string;
  yield_vpa_12m_sum: string;
}

export interface DividendInterface {
  cotacao_fechamento: string;
  data_base: string;
  data_pagamento: string;
  media_yield_12m: string;
  post_excerpt: string;
  post_title: string;
  referencia: string;
  setor: string;
  tipo: string;
  valor: string;
  yeld: string;
}
