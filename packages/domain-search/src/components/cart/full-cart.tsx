import { useIsMutating, useMutation } from '@tanstack/react-query';
import { useIsCurrentMutation } from '../../hooks/use-is-current-mutation';
import { useDomainSearch } from '../../page/context';
import {
	DomainsFullCart,
	DomainsFullCartItems,
	DomainsFullCartSkipButton,
	DomainsFullCartItem,
} from '../../ui';
import type { SelectedDomain } from '../../page/types';

const FullCartItem = ( { item }: { item: SelectedDomain } ) => {
	const { cart } = useDomainSearch();

	const { mutationId, isCurrentMutation } = useIsCurrentMutation();

	const {
		mutate: removeProductFromCart,
		isPending,
		reset,
		error,
	} = useMutation( {
		meta: {
			mutationId,
		},
		mutationFn: ( uuid: string ) => {
			return cart.onRemoveItem( uuid );
		},
		networkMode: 'always',
		retry: false,
	} );

	const isMutating = !! useIsMutating();

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

export const FullCart = () => {
	const { cart, isFullCartOpen, closeFullCart, events, slots, config } = useDomainSearch();

	const totalItems = cart.items.length;
	const totalPrice = cart.total;

	const isMutating = !! useIsMutating();

	return (
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
					<FullCartItem key={ item.uuid } item={ item } />
				) ) }
			</DomainsFullCartItems>
			{ config.skippable && (
				<div>
					<DomainsFullCartSkipButton onSkip={ () => events.onSkip() } disabled={ isMutating } />
				</div>
			) }
		</DomainsFullCart>
	);
};
