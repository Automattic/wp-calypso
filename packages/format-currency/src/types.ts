export interface FormatCurrencyOptions {
	decimal?: string;
	grouping?: string;
	precision?: number;
	symbol?: string;
	stripZeros?: boolean;
	isSmallestUnit?: boolean;
}

export interface CurrencyObject {
	sign: string;
	symbol: string;
	integer: string;
	fraction: string;
}

export interface CurrencyDefinition {
	symbol: string;
	grouping: string;
	decimal: string;
	precision: number;
}

export interface CurrenciesDictionary {
	[ currencyCode: string ]: CurrencyDefinition;
}
