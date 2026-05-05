import { isWpComPlan } from '@automattic/calypso-products';
import { useViewportMatch } from '@wordpress/compose';
import { FunctionComponent } from 'react';
import { useRsmBetterCheckoutExperiment } from '../../hooks/use-rsm-better-checkout-experiment';
import { ItemVariationButtonRow } from './item-variation-button-row';
import { ItemVariationDropDown } from './item-variation-dropdown';
import { ItemVariationRadioButtons } from './item-variation-radio-buttons';
import type { ItemVariationPickerProps } from './types';

/**
 * A fascade component to allow using different types of variant pickers (eg:
 * radio buttons vs. dropdown).
 */
export const ItemVariationPicker: FunctionComponent< ItemVariationPickerProps > = ( props ) => {
	const { selectedItem } = props;
	const isLargeViewport = useViewportMatch( 'large', '>=' );
	const isRsmBetterCheckout = useRsmBetterCheckoutExperiment();

	if ( isWpComPlan( selectedItem.product_slug ) ) {
		if ( isRsmBetterCheckout && isLargeViewport ) {
			return <ItemVariationButtonRow { ...props } />;
		}
		return <ItemVariationRadioButtons { ...props } />;
	}

	// Placeholder for other plan types (e.g., dropdown for non-WPCOM plans or if experiment not assigned)
	return <ItemVariationDropDown { ...props } />;
};

export * from './types';
