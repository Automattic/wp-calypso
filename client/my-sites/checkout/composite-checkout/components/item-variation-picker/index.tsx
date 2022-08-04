import { FunctionComponent } from 'react';
import { ItemVariationDropDown } from './item-variation-dropdown';
import type { ItemVariationPickerProps } from './types';

export const ItemVariationPicker: FunctionComponent< ItemVariationPickerProps > = ( props ) => {
	return <ItemVariationDropDown { ...props } />;
};

export * from './types';
export * from './item-variation-discount-sublabel';
