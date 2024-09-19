import IsEligibleForOneClickCheckoutWrapper from './is-eligible-for-one-click-checkout-wrapper';
import type { IsEligibleForOneClickCheckoutReturnValue } from './use-is-eligible-for-one-click-checkout';
import type { ComponentType } from 'react';

export interface WithIsEligibleForOneClickCheckoutProps {
	isEligibleForOneClickCheckout: IsEligibleForOneClickCheckoutReturnValue;
}

export function withIsEligibleForOneClickCheckout< P >( Component: ComponentType< P > ) {
	return function ( props: Omit< P, keyof WithIsEligibleForOneClickCheckoutProps > ) {
		return (
			<IsEligibleForOneClickCheckoutWrapper component={ Component } componentProps={ props } />
		);
	};
}
