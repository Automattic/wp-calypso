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

export type PanelObject = {
	type: 'header' | 'footer' | 'section';
	title?: string;
	description?: string;
	category?: string;
	selectedPattern: Pattern | null;
	selectedPatterns?: Pattern[];
};
