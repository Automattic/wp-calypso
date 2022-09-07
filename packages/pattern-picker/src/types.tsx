export type PatternMeta = { [ key: string ]: boolean };

export type Pattern = {
	ID: number;
	name: string;
	title: string;
	content: string;
	pattern_meta: PatternMeta;
	site_id: number;
};
