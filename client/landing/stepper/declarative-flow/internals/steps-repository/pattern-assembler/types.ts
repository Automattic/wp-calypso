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

	/** Local attribute */
	key?: string;
};
