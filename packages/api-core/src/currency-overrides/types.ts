export interface CurrencyOverride {
	decimal?: number;
	symbol?: string;
}

export type CurrencyOverrides = Record< string, CurrencyOverride >;
