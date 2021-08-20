/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import {
	isDomainBundledWithPlan,
	isDomainMappingFree,
	isNextDomainFree,
} from 'calypso/lib/cart-values/cart-items';

export function getMappingFreeText( { cart, domain, primaryWithPlansOnly, selectedSite } ) {
	let mappingFreeText;

	if (
		isDomainMappingFree( selectedSite ) ||
		isNextDomainFree( cart ) ||
		isDomainBundledWithPlan( cart, domain )
	) {
		mappingFreeText = __( 'No additional charge with your plan' );
	} else if ( primaryWithPlansOnly ) {
		mappingFreeText = __( 'Included in paid plans' );
	}

	return mappingFreeText;
}
