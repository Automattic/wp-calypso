export type Categories = { [ key: string ]: any };

export type PatternMeta = { [ key: string ]: boolean };

export type Pattern = {
	ID: number;
	name: string;
	title: string;
	html: string;
	categories: Categories;
	pattern_meta: PatternMeta;
	site_id: number;

	/** Rendered attribute if `use_rendered_html` is true */
	styles?: string;

	/** Local attribute */
	key?: string;
};

export type PatternData = {
	id: number;
	name: string;
	key?: string;
};
