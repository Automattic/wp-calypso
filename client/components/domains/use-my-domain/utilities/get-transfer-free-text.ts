/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';
/**
 * Internal dependencies
 */
import { isDomainBundledWithPlan, isNextDomainFree } from 'calypso/lib/cart-values/cart-items';
import { TransferFreeTextProps } from './types';

export function getTransferFreeText( props: TransferFreeTextProps ): string | null {
	const siteHasNoPaidPlan: boolean = ! props.siteIsOnPaidPlan || props.isSignupStep;

	let domainProductFreeText: string | null = null;

	if ( isNextDomainFree( props.cart ) || isDomainBundledWithPlan( props.cart, props.domain ) ) {
		domainProductFreeText = __( 'Free transfer with your plan' );
	} else if ( siteHasNoPaidPlan ) {
		domainProductFreeText = __( 'Included in paid plans' );
	}

	return domainProductFreeText;
}
