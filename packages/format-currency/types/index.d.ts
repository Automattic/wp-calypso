/**
 * TypeScript type definitions for format-currency
 *
 * @todo Migrate `src/index.js` to TypeScript, incorporate these type definitions.
 * (Needs changes to the build chain, see other packages in the monorepo
 * for inspiration, e.g. `@automattic/data-stores`.)
 */

export interface FormatCurrencyOptions {
	decimal?: string;
	grouping?: string;
	precision?: number;
	symbol?: string;
	stripZeros?: boolean;
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

export const CURRENCIES: CurrenciesDictionary;

export function getCurrencyDefaults( currencyCode: string ): CurrencyDefinition;

export function getCurrencyObject(
	number: number,
	currencyCode: string,
	options?: FormatCurrencyOptions
): CurrencyObject | null;

export default function formatCurrency(
	number: number,
	currencyCode: string,
	options?: FormatCurrencyOptions
): string | null;
