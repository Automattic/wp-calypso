/**
 * External dependencies
 */
import { isPlan } from '@automattic/calypso-products';
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { isDomainBundledWithPlan, isNextDomainFree } from 'calypso/lib/cart-values/cart-items';

export function getTransferFreeText( { cart, domain, isSignupStep, selectedSite } ) {
	const siteHasNoPlan = ( selectedSite && ! isPlan( selectedSite.plan ) ) || isSignupStep;

	let domainProductFreeText = null;

	if ( isNextDomainFree( cart ) || isDomainBundledWithPlan( cart, domain ) ) {
		domainProductFreeText = __( 'Free transfer with your plan' );
	} else if ( siteHasNoPlan ) {
		domainProductFreeText = __( 'Included in paid plans' );
	}

	return domainProductFreeText;
}
