import { FunctionComponent } from 'react';
import { ItemVariationRadioButtons } from './item-variation-radio-buttons';
import type { ItemVariationPickerProps } from './types';

export const ItemVariationPicker: FunctionComponent< ItemVariationPickerProps > = ( props ) => (
	<ItemVariationRadioButtons { ...props } />
);

export * from './types';
