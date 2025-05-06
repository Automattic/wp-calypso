import { isWpComPlan } from '@automattic/calypso-products';
import { FunctionComponent } from 'react';
import {
	useStreamlinedPriceExperiment,
	isStreamlinedPriceRadioTreatment,
} from 'calypso/my-sites/plans-features-main/hooks/use-streamlined-price-experiment';
import { ItemVariationDropDown } from './item-variation-dropdown';
import { ItemVariationRadioButtons } from './item-variation-radio-buttons';
import type { ItemVariationPickerProps } from './types';

/**
 * A fascade component to allow using different types of variant pickers (eg:
 * radio buttons vs. dropdown).
 */
export const ItemVariationPicker: FunctionComponent< ItemVariationPickerProps > = ( props ) => {
	const { selectedItem } = props;
	const [ isStreamlinedPriceExperimentLoading, streamlinedPriceExperimentAssignment ] =
		useStreamlinedPriceExperiment();

	if ( isStreamlinedPriceExperimentLoading ) {
		return null;
	}

	if (
		isWpComPlan( selectedItem.product_slug ) &&
		isStreamlinedPriceRadioTreatment( streamlinedPriceExperimentAssignment )
	) {
		return <ItemVariationRadioButtons { ...props } />;
	}

	// Placeholder for other plan types (e.g., dropdown for non-WPCOM plans or if experiment not assigned)
	return <ItemVariationDropDown { ...props } />;
};

export * from './types';
