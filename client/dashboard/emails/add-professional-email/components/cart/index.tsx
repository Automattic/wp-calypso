import { useLayoutEffect } from 'react';
import { useAddMailboxesContext } from '../../context';
import { MiniCart } from './mini-cart';

export const Cart = () => {
	const { cart, isFullCartOpen, closeFullCart } = useAddMailboxesContext();

	const totalItems = cart.items.length;

	useLayoutEffect( () => {
		if ( totalItems === 0 && isFullCartOpen ) {
			closeFullCart();
		}
	}, [ totalItems, isFullCartOpen, closeFullCart ] );

	return (
		<>
			<MiniCart />
			{ /* <FullCart /> */ }
		</>
	);
};
