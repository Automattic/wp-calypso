export interface PatternCategory {
	slug: string;
	title: string;
	description: string;
}

export interface PatternDefinition {
	name: string;
	ID: number | null;
	title: string;
	categories?: Record< string, PatternCategory >;
	description?: string;
	html?: string;
	modified_date?: string;
	pattern_meta?: { is_mobile: boolean; is_web: boolean };
	site_id?: number;
	source_url?: string;
	tags?: Record< string, { slug: string; title: string; description: string } >;
}
