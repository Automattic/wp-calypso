import { __ } from '@wordpress/i18n';
import { isDomainBundledWithPlan, isNextDomainFree } from 'calypso/lib/cart-values/cart-items';

export function getTransferFreeText( { cart, domain, isSignupStep, siteIsOnPaidPlan } ) {
	const siteHasNoPaidPlan = ! siteIsOnPaidPlan || isSignupStep;

	let domainProductFreeText = null;

	if ( isNextDomainFree( cart ) || isDomainBundledWithPlan( cart, domain ) ) {
		domainProductFreeText = __( 'Free transfer with your plan' );
	} else if ( siteHasNoPaidPlan ) {
		domainProductFreeText = __( 'Included in annual plans' );
	}

	return domainProductFreeText;
}
