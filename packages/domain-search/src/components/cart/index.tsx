import { useIsMutating, useMutation } from '@tanstack/react-query';
import { useIsCurrentMutation } from '../../hooks/use-is-current-mutation';
import { useDomainSearch } from '../../page/context';
import {
	DomainsFullCart,
	DomainsFullCartItem,
	DomainsFullCartItems,
	DomainsFullCartSkipButton,
	DomainsMiniCart,
} from '../../ui';
import type { SelectedDomain } from '../../page/types';

const CartItem = ( { item }: { item: SelectedDomain } ) => {
	const { cart } = useDomainSearch();

	const {
		mutate: removeProductFromCart,
		isPending,
		reset,
		error,
		submittedAt,
	} = useMutation( {
		mutationFn: ( uuid: string ) => {
			return cart.onRemoveItem( uuid );
		},
		networkMode: 'always',
		retry: false,
	} );

	const isMutating = !! useIsMutating();
	const isCurrentMutation = useIsCurrentMutation( submittedAt );

	return (
		<DomainsFullCartItem
			key={ item.uuid }
			domain={ item }
			disabled={ isMutating }
			isBusy={ isPending }
			onRemove={ () => removeProductFromCart( item.uuid ) }
			errorMessage={ isCurrentMutation ? error?.message : undefined }
			removeErrorMessage={ reset }
		/>
	);
};

export const Cart = () => {
	const { cart, isFullCartOpen, closeFullCart, config, events, openFullCart, slots } =
		useDomainSearch();

	const totalItems = cart.items.length;
	const totalPrice = cart.total;

	const isMutating = !! useIsMutating();

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
