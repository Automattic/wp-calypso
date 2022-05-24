import { __ } from '@wordpress/i18n';
import { isDomainBundledWithPlan, isNextDomainFree } from 'calypso/lib/cart-values/cart-items';
import { isStarterPlanEnabled } from 'calypso/my-sites/plans-comparison';

export function getTransferFreeText( { cart, domain, isSignupStep, siteIsOnPaidPlan } ) {
	const siteHasNoPaidPlan = ! siteIsOnPaidPlan || isSignupStep;

	let domainProductFreeText = null;

	if ( isNextDomainFree( cart ) || isDomainBundledWithPlan( cart, domain ) ) {
		domainProductFreeText = __( 'Free transfer with your plan' );
	} else if ( siteHasNoPaidPlan ) {
		domainProductFreeText = isStarterPlanEnabled()
			? __( 'Included in paid plans' )
			: __( 'Included in Pro plan' );
	}

	return domainProductFreeText;
}
