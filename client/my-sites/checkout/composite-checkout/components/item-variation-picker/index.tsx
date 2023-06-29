import { FunctionComponent } from 'react';
import { ItemVariationDropDown } from './item-variation-dropdown';
import type { ItemVariationPickerProps } from './types';

/**
 * A fascade component to allow using different types of variant pickers (eg:
 * radio buttons vs. dropdown).
 */
export const ItemVariationPicker: FunctionComponent< ItemVariationPickerProps > = ( props ) => {
	return <ItemVariationDropDown { ...props } />;
};

export * from './types';
