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
	tags: Record< string, Tag | undefined >;
};

export type PatternType = 'header' | 'footer' | 'section';

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
	type: PatternType;
	label?: string;
	description?: string;
	category?: string;
	selectedPattern: Pattern | null;
	selectedPatterns?: Pattern[];
};

export type ScreenName = 'main' | 'styles' | 'confirmation' | 'activation' | 'upsell' | 'pages';

export type Tag = {
	slug: string;
	title: string;
	description: string;
};

export type HtmlTransformer = {
	patternHtml: string;
	pageTitles: string[];
	options: { replaceCurrentPages: boolean };
};
