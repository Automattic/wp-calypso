declare const __i18n_text_domain__: string;

interface LayoutCategory {
	slug: string;
	title: string;
	description: string;
}

interface LayoutDefinition {
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
