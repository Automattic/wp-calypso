import { useLayoutEffect } from 'react';
import { useDomainSearch } from '../../page/context';
import { FullCart } from './full-cart';
import { MiniCart } from './mini-cart';

export const Cart = () => {
	const { cart, isFullCartOpen, closeFullCart } = useDomainSearch();

	const totalItems = cart.items.length;

	useLayoutEffect( () => {
		if ( totalItems === 0 && isFullCartOpen ) {
			closeFullCart();
		}
	}, [ totalItems, isFullCartOpen, closeFullCart ] );

	return (
		<>
			<MiniCart />
			<FullCart />
		</>
	);
};
