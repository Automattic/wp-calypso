import { __ } from '@wordpress/i18n';
import {
	isDomainBundledWithPlan,
	isDomainMappingFree,
	isNextDomainFree,
} from 'calypso/lib/cart-values/cart-items';
import { isStarterPlanEnabled } from 'calypso/my-sites/plans-comparison';

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
		mappingFreeText = isStarterPlanEnabled()
			? __( 'Included in paid plans' )
			: __( 'Included in Pro plan' );
	}

	return mappingFreeText;
}
