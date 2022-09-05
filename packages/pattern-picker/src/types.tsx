export type Pattern = {
	ID: number;
	name: string;
	title: string;
	content: string;
	pattern_meta: { [ key: string ]: boolean };
	site_id: number;
};
