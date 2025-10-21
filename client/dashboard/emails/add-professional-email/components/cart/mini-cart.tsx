import { useIsMutating } from '@tanstack/react-query';
import { useAddMailboxesContext } from '../../context';
import { DomainsMiniCart } from '../domains-mini-cart';

export const MiniCart = () => {
	const { cart, isFullCartOpen, openFullCart } = useAddMailboxesContext();

	const totalItems = cart.items.length;
	const totalPrice = cart.total;

	const isMutating = !! useIsMutating();

	return (
		<DomainsMiniCart
			isMiniCartOpen={ ! isFullCartOpen && totalItems > 0 }
			totalItems={ totalItems }
			totalPrice={ totalPrice }
			openFullCart={ openFullCart }
			onContinue={ () => {
				// TODO: bind to onsubmit
			} }
			isCartBusy={ isMutating }
		/>
	);
};
