export interface ThemeFilterItem {
	name: string;
	description: string;
}

export type ThemeFilter = Record< string, ThemeFilterItem >;
export type ThemeFilters = Record< string, ThemeFilter >;
