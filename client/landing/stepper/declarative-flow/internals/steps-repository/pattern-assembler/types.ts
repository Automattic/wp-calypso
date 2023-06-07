export type Pattern = {
	ID: number;
	name: string;
	title: string;
	description?: string;
	category?: Category;
	categories: Record< string, Category | undefined >;
	key?: string;
	pattern_meta?: Record< string, boolean | undefined >;
	html?: string;
};

export interface NavigatorLocation {
	path: string;
	isInitial: boolean;
}

export type Category = {
	name?: string;
	slug?: string;
	label?: string;
	description?: string;
};
