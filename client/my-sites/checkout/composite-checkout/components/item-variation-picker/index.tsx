import { FunctionComponent } from 'react';
import { ItemVariationDropDown } from './item-variation-dropdown';
import { ItemVariationRadioButtons } from './item-variation-radio-buttons';
import type { ItemVariationPickerProps } from './types';

export const ItemVariationPicker: FunctionComponent< ItemVariationPickerProps > = ( props ) =>
	props.type === 'dropdown' ? (
		<ItemVariationDropDown { ...props } />
	) : (
		<ItemVariationRadioButtons { ...props } />
	);

export * from './types';
