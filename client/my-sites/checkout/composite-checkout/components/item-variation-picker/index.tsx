import { FunctionComponent } from 'react';
import { ItemVariationDropDown } from './item-variation-dropdown';
import { ItemVariationRadioButtons } from './item-variation-radio-buttons';
import type { ItemVariationPickerProps } from './types';

export const ItemVariationPicker: FunctionComponent<
	ItemVariationPickerProps & { type: 'dropdown' | 'radio' }
> = ( props ) => {
	if ( props.type === 'radio' ) {
		return <ItemVariationRadioButtons { ...props } />;
	}
	return <ItemVariationDropDown { ...props } />;
};

export * from './types';
