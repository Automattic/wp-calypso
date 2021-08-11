/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import useCartKey from './use-cart-key';

export default function withCartKey< P >( Component: React.ComponentType< P > ) {
	return function CartKeyWrapper( props: P ): JSX.Element {
		const cartKey = useCartKey();
		return <Component { ...props } cartKey={ cartKey } />;
	};
}
