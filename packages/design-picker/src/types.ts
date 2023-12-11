import type { FONT_PAIRINGS } from './constants';
import type { GlobalStyles } from '@automattic/data-stores/src/site/types'; // Import from a specific file to avoid the circular dependencies
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
	description?: string;
}

export interface StyleVariation {
	slug: string;
	title?: string;
	settings: {
		color: {
			palette: {
				theme: StyleVariationSettingsColorPalette[];
			};
		};
	};
	styles: {
		color: StyleVariationStylesColor;
	};
	inline_css?: string;
}

export interface StyleVariationSettingsColorPalette {
	color: string;
	name: string;
	slug: string;
}

export interface StyleVariationPreview {
	color: StyleVariationPreviewColorPalette;
}

export interface StyleVariationPreviewColorPalette {
	base?: string;
	contrast?: string;
	background?: string;
	foreground?: string;
	primary?: string;
	secondary?: string;
	tertiary?: string;
}

export interface StyleVariationStylesColor {
	background?: string;
	text?: string;
}

export interface DesignRecipe {
	stylesheet?: string;
	pattern_ids?: number[] | string[];
	pattern_html?: string;
	header_pattern_ids?: number[] | string[];
	header_html?: string;
	footer_pattern_ids?: number[] | string[];
	footer_html?: string;
	color_variation_title?: string;
	font_variation_title?: string;
	slug?: string;
}

export interface SoftwareSet {
	slug: string;
}

export type DesignFeatures = 'anchorfm'; // For additional features, = 'anchorfm' | 'feature2' | 'feature3'

/**
 * For measuring what kind of the design user picked.
 */
export type DesignType =
	| 'vertical'
	| 'premium'
	| 'standard' // The design is free.
	| 'default' // The default design and it means user skipped the step and didn't select any design.
	| 'anchor-fm'
	| 'assembler';

export interface PreviewData {
	site_title?: string;
	site_tagline?: string;
	site_logo_url?: string;
}

export interface Design {
	slug: string;
	title: string;
	description?: string;
	recipe?: DesignRecipe;
	is_premium: boolean;
	is_externally_managed?: boolean;
	categories: Category[];
	features: DesignFeatures[];
	is_featured_picks?: boolean; // Whether this design will be featured in the sidebar. Example: Blank Canvas
	showFirst?: boolean; // Whether this design will appear at the top, regardless of category
	preview?: 'static';
	design_type?: DesignType;
	style_variations?: StyleVariation[];
	price?: string;
	software_sets?: SoftwareSet[];
	is_virtual?: boolean;
	preview_data?: PreviewData;
	screenshot?: string;

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

export interface DesignOptions {
	styleVariation?: StyleVariation;
	globalStyles?: GlobalStyles;
}

export interface DesignPreviewOptions {
	language?: string;
	site_title?: string;
	site_tagline?: string;
	viewport_height?: number;
	use_screenshot_overrides?: boolean;
	disable_viewport_height?: boolean;
	remove_assets?: boolean;
	style_variation?: StyleVariation;
	viewport_unit_to_px?: boolean;
}

/** @deprecated used for Gutenboarding (/new flow) */
export interface DesignUrlOptions {
	iframe?: boolean;
	site_title?: string;
}
