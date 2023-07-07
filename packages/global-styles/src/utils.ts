import {
	DEFAULT_GLOBAL_STYLES_VARIATION_SLUG,
	DEFAULT_GLOBAL_STYLES_VARIATION_TITLE,
} from './constants';
import { GlobalStylesObject, GlobalStylesVariationType } from './types';

export const getVariationTitle = ( variation: GlobalStylesObject | null ) =>
	variation?.title ?? DEFAULT_GLOBAL_STYLES_VARIATION_TITLE;

export const getVariationType = (
	variation: GlobalStylesObject | null
): GlobalStylesVariationType =>
	variation && variation.title !== DEFAULT_GLOBAL_STYLES_VARIATION_TITLE
		? GlobalStylesVariationType.Premium
		: GlobalStylesVariationType.Free;

export const isDefaultGlobalStylesVariationSlug = ( slug?: string ) =>
	! slug || slug === DEFAULT_GLOBAL_STYLES_VARIATION_SLUG;
