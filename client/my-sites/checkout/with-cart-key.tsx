import useCartKey from './use-cart-key';
import type { CartKey } from '@automattic/shopping-cart';
import type { ComponentType } from 'react';

export type WithCartKeyProps = { cartKey: CartKey };

export default function withCartKey< P extends WithCartKeyProps = WithCartKeyProps >(
	Component: ComponentType< P >
) {
	return function CartKeyWrapper( props: Omit< P, keyof WithCartKeyProps > ) {
		const cartKey = useCartKey();
		return <Component { ...( props as P ) } cartKey={ cartKey } />;
	};
}
