/**
 * External dependencies
 */
import type { ValuesType } from 'utility-types';

/**
 * Internal dependencies
 */
import type { FONT_PAIRINGS } from './constants';

export type Font = ValuesType< ValuesType< typeof FONT_PAIRINGS > >;

export interface FontPair {
	headings: Font;
	base: Font;
}

export type DesignFeatures = 'anchorfm'; // For additional features, = 'anchorfm' | 'feature2' | 'feature3'

export interface Design {
	categories: Array< string >;
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

	/**
	 * Quickly hide a design from the picker without having to remove
	 * it from the list of available design configs (stored in the
	 * `@automattic/design-picker` package)
	 */
	hide?: boolean;
}
