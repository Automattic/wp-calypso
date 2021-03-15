export interface LayoutCategory {
	slug: string;
	title: string;
	description: string;
}

export interface LayoutDefinition {
	name: string;
	ID: number | null;
	title: string;
	categories?: Record< string, LayoutCategory >;
	description?: string;
	html?: string;
	modified_date?: string;
	pattern_meta?: { is_mobile: boolean; is_web: boolean };
	site_id?: number;
	source_url?: string;
	tags?: Record< string, { slug: string; title: string; description: string } >;
}
