import { useIsMutating, useMutation } from '@tanstack/react-query';
import { useIsCurrentMutation } from '../../hooks/use-is-current-mutation';
import { useDomainSearch } from '../../page/context';
import {
	DomainsFullCart,
	DomainsFullCartItems,
	DomainsFullCartSkipButton,
	DomainsFullCartItem,
	DomainsFullCartBundleItem,
} from '../../ui';
import { groupCartItems } from './group-cart-items';
import type { BundleCartEntry } from './group-cart-items';
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

const FullCartBundle = ( { bundle }: { bundle: BundleCartEntry } ) => {
	const { cart } = useDomainSearch();

	const { mutationId, isCurrentMutation } = useIsCurrentMutation();

	const {
		mutate: removeBundleFromCart,
		isPending,
		reset,
		error,
	} = useMutation( {
		meta: {
			mutationId,
		},
		mutationFn: () => {
			// Prefer the app layer's batched all-or-nothing removal; fall back to
			// removing each member individually when it isn't provided.
			if ( cart.onRemoveBundle ) {
				return cart.onRemoveBundle( bundle.groupId );
			}

			return Promise.all( bundle.members.map( ( member ) => cart.onRemoveItem( member.uuid ) ) );
		},
		networkMode: 'always',
		retry: false,
	} );

	const isMutating = !! useIsMutating();

	return (
		<DomainsFullCartBundleItem
			members={ bundle.members }
			price={ bundle.price }
			disabled={ isMutating }
			isBusy={ isPending }
			onRemove={ () => removeBundleFromCart() }
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
				{ groupCartItems( cart.items ).map( ( entry ) =>
					entry.type === 'bundle' ? (
						<FullCartBundle key={ `bundle-${ entry.groupId }` } bundle={ entry } />
					) : (
						<FullCartItem key={ entry.item.uuid } item={ entry.item } />
					)
				) }
			</DomainsFullCartItems>
			{ config.skippable && (
				<div>
					<DomainsFullCartSkipButton onSkip={ () => events.onSkip() } disabled={ isMutating } />
				</div>
			) }
		</DomainsFullCart>
	);
};
