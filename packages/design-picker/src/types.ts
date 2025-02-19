import type { GlobalStylesObject } from '@automattic/global-styles';

export interface Category {
	slug: string;
	name: string;
	description?: string;
}

export interface StyleVariation extends GlobalStylesObject {}

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

/**
 * For measuring what kind of the design user picked.
 */
export type DesignType =
	| 'vertical'
	| 'premium' // The design is non-free, Design.design_tier will have more nuance.
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
	is_externally_managed?: boolean;
	is_bundled_with_woo?: boolean;
	categories: Category[];
	is_featured_picks?: boolean; // Whether this design will be featured in the sidebar. Example: Blank Canvas
	showFirst?: boolean; // Whether this design will appear at the top, regardless of category
	preview?: 'static';
	design_type?: DesignType;
	design_tier: string | null;
	style_variations?: StyleVariation[];
	price?: string;
	software_sets?: SoftwareSet[];
	is_virtual?: boolean;
	preview_data?: PreviewData;
	screenshot?: string;
	demo_uri?: string;
	default?: boolean;

	/** @deprecated TODO: replace both with just stylesheet */
	stylesheet?: string;
	theme: string;
}

export interface DesignOptions {
	styleVariation?: StyleVariation;
	globalStyles?: GlobalStylesObject;
	/** Potentially runs Headstart. */
	enableThemeSetup?: boolean;
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
