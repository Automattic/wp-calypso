import { useIsMutating } from '@tanstack/react-query';
import { useLayoutEffect } from 'react';
import { useDomainSearch } from '../../page/context';
import {
	DomainsFullCart,
	DomainsFullCartItems,
	DomainsFullCartSkipButton,
	DomainsMiniCart,
} from '../../ui';
import { CartItem } from './item';

export const Cart = () => {
	const { cart, isFullCartOpen, closeFullCart, config, events, openFullCart, slots } =
		useDomainSearch();

	const isMutating = !! useIsMutating();

	const totalItems = cart.items.length;
	const totalPrice = cart.total;

	useLayoutEffect( () => {
		if ( totalItems === 0 && isFullCartOpen ) {
			closeFullCart();
		}
	}, [ totalItems, isFullCartOpen, closeFullCart ] );

	return (
		<>
			<DomainsMiniCart
				isMiniCartOpen={ ! isFullCartOpen && totalItems > 0 }
				totalItems={ totalItems }
				totalPrice={ totalPrice }
				openFullCart={ openFullCart }
				onContinue={ events.onContinue }
				isCartBusy={ isMutating }
			/>
			<DomainsFullCart
				isFullCartOpen={ isFullCartOpen }
				closeFullCart={ closeFullCart }
				onContinue={ events.onContinue }
				isCartBusy={ isMutating }
				totalItems={ totalItems }
				totalPrice={ totalPrice }
			>
				{ slots?.BeforeFullCartItems && <slots.BeforeFullCartItems /> }
				<DomainsFullCartItems>
					{ cart.items.map( ( item ) => (
						<CartItem key={ item.uuid } item={ item } />
					) ) }
				</DomainsFullCartItems>
				{ config.skippable && (
					<div>
						<DomainsFullCartSkipButton onSkip={ () => events.onSkip() } />
					</div>
				) }
			</DomainsFullCart>
		</>
	);
};
