import { useMemo } from 'react';
import { Cart } from '../../components/cart';
import { DomainSearchContext, useDomainSearch } from '../../page/context';

/**
 * The classic cart, reporting what is removed from it the way a row reports
 * its own removals. Rows read the outer context, so a removal is never counted twice.
 */
export const NamePulseCart = () => {
	const context = useDomainSearch();

	const value = useMemo( () => {
		const { cart, events } = context;
		const { onRemoveBundle } = cart;

		return {
			...context,
			cart: {
				...cart,
				onRemoveItem: async ( uuid: string ) => {
					const item = cart.items.find( ( cartItem ) => cartItem.uuid === uuid );
					const result = await cart.onRemoveItem( uuid );

					if ( item ) {
						events.onNamePulseTracksEvent( 'result_remove_from_cart', {
							remove_source: 'cart',
							tld: item.tld,
							is_bundle: Boolean( item.bundle ),
						} );
					}

					return result;
				},
				...( onRemoveBundle && {
					onRemoveBundle: async ( groupId: string ) => {
						const result = await onRemoveBundle( groupId );

						events.onNamePulseTracksEvent( 'result_remove_from_cart', {
							remove_source: 'cart',
							is_bundle: true,
							domain_count: cart.items.filter( ( item ) => item.bundle?.groupId === groupId )
								.length,
						} );

						return result;
					},
				} ),
			},
		};
	}, [ context ] );

	return (
		<DomainSearchContext.Provider value={ value }>
			<Cart />
		</DomainSearchContext.Provider>
	);
};
