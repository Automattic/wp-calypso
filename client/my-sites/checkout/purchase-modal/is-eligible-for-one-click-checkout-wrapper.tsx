import { useIsEligibleForOneClickCheckout } from './use-is-eligible-for-one-click-checkout';
import type { WithIsEligibleForOneClickCheckoutProps } from './with-is-eligible-for-one-click-checkout';
import type { ComponentType } from 'react';

export default function IsEligibleForOneClickCheckoutWrapper< P >( props: {
	component: ComponentType< P >;
	componentProps: Omit< P, keyof WithIsEligibleForOneClickCheckoutProps >;
} ) {
	const isEligibleForOneClickCheckout = useIsEligibleForOneClickCheckout();
	return (
		<props.component
			{ ...( props.componentProps as P ) }
			isEligibleForOneClickCheckout={ isEligibleForOneClickCheckout }
		/>
	);
}
