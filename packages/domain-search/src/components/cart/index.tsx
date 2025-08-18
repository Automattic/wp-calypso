import { useMutation } from '@tanstack/react-query';
import { useDomainSearch } from '../../page/context';
import {
	DomainsFullCart,
	DomainsFullCartItem,
	DomainsFullCartItems,
	DomainsMiniCart,
} from '../../ui';

export const Cart = () => {
	const { cart, isFullCartOpen, closeFullCart, events, openFullCart, slots } = useDomainSearch();

	const totalItems = cart.items.length;
	const totalPrice = cart.total;

	const { mutate: removeProductFromCart, isPending } = useMutation( {
		mutationFn: ( uuid: string ) => cart.onRemoveItem( uuid ),
	} );

	return (
		<>
			<DomainsMiniCart
				isMiniCartOpen={ ! isFullCartOpen && totalItems > 0 }
				totalItems={ totalItems }
				totalPrice={ totalPrice }
				openFullCart={ openFullCart }
				onContinue={ events.onContinue }
				isCartBusy={ false }
			/>
			<DomainsFullCart
				isFullCartOpen={ isFullCartOpen }
				closeFullCart={ closeFullCart }
				onContinue={ events.onContinue }
				isCartBusy={ false }
				totalItems={ totalItems }
				totalPrice={ totalPrice }
			>
				{ slots?.BeforeFullCartItems && <slots.BeforeFullCartItems /> }
				<DomainsFullCartItems>
					{ cart.items.map( ( item ) => (
						<DomainsFullCartItem
							key={ item.uuid }
							domain={ item }
							isBusy={ isPending }
							onRemove={ () => removeProductFromCart( item.uuid ) }
							errorMessage={ null }
							removeErrorMessage={ () => {} }
						/>
					) ) }
				</DomainsFullCartItems>
			</DomainsFullCart>
		</>
	);
};
