import {
	type IsEligibleForOneClickCheckoutReturnValue,
	useIsEligibleForOneClickCheckout,
} from './use-is-eligible-for-one-click-checkout';
import type { ComponentType } from 'react';

export interface WithIsEligibleForOneClickCheckoutProps {
	isEligibleForOneClickCheckout: IsEligibleForOneClickCheckoutReturnValue;
}

export function withIsEligibleForOneClickCheckout< P >( Component: ComponentType< P > ) {
	return function IsEligibleForOneClickCheckoutWrapper(
		props: Omit< P, keyof WithIsEligibleForOneClickCheckoutProps >
	) {
		const isEligibleForOneClickCheckout = useIsEligibleForOneClickCheckout();
		return (
			<Component
				{ ...( props as P ) }
				isEligibleForOneClickCheckout={ isEligibleForOneClickCheckout }
			/>
		);
	};
}
