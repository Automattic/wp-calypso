import type { FONT_PAIRINGS } from './constants';
import type { ValuesType } from 'utility-types';

export type Font = ValuesType< ValuesType< typeof FONT_PAIRINGS > >;

/** @deprecated used for Gutenboarding (/new flow) */
export interface FontPair {
	headings: Font;
	base: Font;
}

export interface Category {
	slug: string;
	name: string;
}

export interface DesignRecipe {
	stylesheet?: string;
	patternIds?: number[];
}

export type DesignFeatures = 'anchorfm'; // For additional features, = 'anchorfm' | 'feature2' | 'feature3'

export interface Design {
	slug: string;
	title: string;
	recipe?: DesignRecipe;
	is_premium: boolean;
	categories: Category[];
	features: DesignFeatures[];
	is_featured_picks?: boolean; // Whether this design will be featured in the sidebar. Example: Blank Canvas
	showFirst?: boolean; // Whether this design will appear at the top, regardless of category
	preview?: 'static';

	/** @deprecated used for Gutenboarding (/new flow) */
	stylesheet?: string;
	/** @deprecated used for Gutenboarding (/new flow) */
	template: string;
	/** @deprecated used for Gutenboarding (/new flow) */
	theme: string;
	/** @deprecated used for Gutenboarding (/new flow) */
	fonts?: FontPair;
	/** @deprecated used for Gutenboarding (/new flow) */
	is_alpha?: boolean;
	/** @deprecated used for Gutenboarding (/new flow) */
	is_fse?: boolean;
	/** @deprecated used for Gutenboarding (/new flow) */
	hide?: boolean;
}

export interface DesignPreviewOptions {
	language?: string;
	verticalId?: string;
	siteTitle?: string;
}

/** @deprecated used for Gutenboarding (/new flow) */
export interface DesignUrlOptions {
	iframe?: boolean;
	site_title?: string;
}

export interface BlockRecipe {
	id: number;
	slug: string;
	title: string;
	stylesheet: string;
	pattern_ids: number[];
	modified_date: string;
}
