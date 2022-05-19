import useCartKey from './use-cart-key';
import type { ComponentType } from 'react';

export default function withCartKey< P >( Component: ComponentType< P > ) {
	return function CartKeyWrapper( props: P ) {
		const cartKey = useCartKey();
		return <Component { ...props } cartKey={ cartKey } />;
	};
}
