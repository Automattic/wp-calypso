import { useDomainSearch } from '../../page/context';
import {
	DomainsFullCart,
	DomainsFullCartItem,
	DomainsFullCartItems,
	DomainsMiniCart,
} from '../../ui';
import type { SelectedDomain } from '../../page/types';

const CartItem = ( { item }: { item: SelectedDomain } ) => {
	const { cart } = useDomainSearch();

	return (
		<DomainsFullCartItem
			key={ item.uuid }
			domain={ item }
			disabled={ false }
			isBusy={ false }
			onRemove={ () => cart.onRemoveItem( item.uuid ) }
			errorMessage={ null }
			removeErrorMessage={ () => {} }
		/>
	);
};

export const Cart = () => {
	const { cart, isFullCartOpen, closeFullCart, events, openFullCart, slots } = useDomainSearch();

	const totalItems = cart.items.length;
	const totalPrice = cart.total;

	const isCartBusy = false;

	return (
		<>
			<DomainsMiniCart
				isMiniCartOpen={ ! isFullCartOpen && totalItems > 0 }
				totalItems={ totalItems }
				totalPrice={ totalPrice }
				openFullCart={ openFullCart }
				onContinue={ events.onContinue }
				isCartBusy={ isCartBusy }
			/>
			<DomainsFullCart
				isFullCartOpen={ isFullCartOpen }
				closeFullCart={ closeFullCart }
				onContinue={ events.onContinue }
				isCartBusy={ isCartBusy }
				totalItems={ totalItems }
				totalPrice={ totalPrice }
			>
				{ slots?.BeforeFullCartItems && <slots.BeforeFullCartItems /> }
				<DomainsFullCartItems>
					{ cart.items.map( ( item ) => (
						<CartItem key={ item.uuid } item={ item } />
					) ) }
				</DomainsFullCartItems>
			</DomainsFullCart>
		</>
	);
};
