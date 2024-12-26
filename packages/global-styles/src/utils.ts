import { DEFAULT_GLOBAL_STYLES_VARIATION_TITLE } from './constants';
import { isDefaultVariation } from './gutenberg-bridge';
import { GlobalStylesObject, GlobalStylesVariationType } from './types';

export const getVariationTitle = ( variation: GlobalStylesObject | null ) =>
	variation?.title ?? DEFAULT_GLOBAL_STYLES_VARIATION_TITLE;

export const getVariationType = (
	variation: GlobalStylesObject | null
): GlobalStylesVariationType =>
	variation && isDefaultVariation( variation )
		? GlobalStylesVariationType.Premium
		: GlobalStylesVariationType.Free;
