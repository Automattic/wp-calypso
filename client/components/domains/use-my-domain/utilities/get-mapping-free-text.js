import { __ } from '@wordpress/i18n';
import {
	isDomainBundledWithPlan,
	isDomainMappingFree,
	isNextDomainFree,
} from 'calypso/lib/cart-values/cart-items';

export function getMappingFreeText( {
	cart,
	domain,
	primaryWithPlansOnly,
	selectedSite,
	isSignupStep,
} ) {
	let mappingFreeText;

	if (
		isDomainMappingFree( selectedSite ) ||
		isNextDomainFree( cart ) ||
		isDomainBundledWithPlan( cart, domain )
	) {
		mappingFreeText = __( 'No additional charge with your plan' );
	} else if ( primaryWithPlansOnly || isSignupStep ) {
		mappingFreeText = __( 'Included in annual plans' );
	}

	return mappingFreeText;
}
