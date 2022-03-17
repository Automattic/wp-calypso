export interface WpcomClientCredentials {
	client_id: string;
	client_secret: string;
}

// A copy of design picker types to avoid creating a circular dependency between data-stores and design-picker
export interface FontPair {
	headings: string;
	base: string;
}

export type DesignFeatures = 'anchorfm' | 'difm-lite-default';

export interface Category {
	slug: string;
	name: string;
}
export interface Design {
	categories: Array< Category >;
	fonts?: FontPair;
	is_alpha?: boolean;
	is_fse?: boolean;
	is_premium: boolean;
	stylesheet?: string;
	slug: string;
	template: string;
	theme: string;
	preview?: 'static';
	title: string;
	features: Array< DesignFeatures >;

	// This design will appear at the top, regardless of category
	showFirst?: boolean;

	/**
	 * Quickly hide a design from the picker without having to remove
	 * it from the list of available design configs (stored in the
	 * `@automattic/design-picker` package)
	 */
	hide?: boolean;

	// designs with a "featured" term in the theme_picks taxonomy
	is_featured_picks?: boolean;
}
