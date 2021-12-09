import type { FONT_PAIRINGS } from './constants';
import type { ValuesType } from 'utility-types';

export type Font = ValuesType< ValuesType< typeof FONT_PAIRINGS > >;

export interface FontPair {
	headings: Font;
	base: Font;
}

export interface Category {
	slug: string;
	name: string;
}

export type DesignFeatures = 'anchorfm'; // For additional features, = 'anchorfm' | 'feature2' | 'feature3'

export interface Design {
	categories: Array< Category >;
	fonts?: FontPair;
	is_alpha?: boolean;
	is_fse?: boolean;
	is_premium: boolean;
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

export interface DesignUrlOptions {
	iframe?: boolean;
}
