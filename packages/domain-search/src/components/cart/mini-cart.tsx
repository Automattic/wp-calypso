import { useIsMutating } from '@tanstack/react-query';
import { useDomainSearch } from '../../page/context';
import { DomainsMiniCart } from '../../ui';

export const MiniCart = () => {
	const { cart, isFullCartOpen, openFullCart, events } = useDomainSearch();

	const totalItems = cart.items.length;
	const totalPrice = cart.total;

	const isMutating = !! useIsMutating();

	return (
		<DomainsMiniCart
			isMiniCartOpen={ ! isFullCartOpen && totalItems > 0 }
			totalItems={ totalItems }
			totalPrice={ totalPrice }
			openFullCart={ openFullCart }
			onContinue={ events.onContinue }
			isCartBusy={ isMutating }
		/>
	);
};
