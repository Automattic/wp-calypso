/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { isDomainBundledWithPlan, isNextDomainFree } from 'calypso/lib/cart-values/cart-items';

export function getTransferFreeText( { cart, domain, isSignupStep, siteIsOnPaidPlan } ) {
	const siteHasNoPaidPlan = ! siteIsOnPaidPlan || isSignupStep;

	let domainProductFreeText = null;

	if ( isNextDomainFree( cart ) || isDomainBundledWithPlan( cart, domain ) ) {
		domainProductFreeText = __( 'Free one year renewal with your plan' );
	} else if ( siteHasNoPaidPlan ) {
		domainProductFreeText = __( 'Included in paid plans' );
	}

	return domainProductFreeText;
}
