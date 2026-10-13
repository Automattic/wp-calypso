import { useMemo } from 'react';
import { Cart } from '../../components/cart';
import { DomainSearchContext, useDomainSearch } from '../../page/context';

/**
 * The classic cart, reporting View cart and removals. Rows use the outer
 * context, so a removal is never counted twice.
 */
export const NamePulseCart = () => {
	const context = useDomainSearch();

	const value = useMemo( () => {
		const { cart, events, openFullCart } = context;
		const { onRemoveBundle } = cart;

		return {
			...context,
			openFullCart: () => {
				events.onNamePulseTracksEvent( 'view_cart_click', {} );
				openFullCart();
			},
			cart: {
				...cart,
				onRemoveItem: async ( uuid: string ) => {
					const item = cart.items.find( ( cartItem ) => cartItem.uuid === uuid );
					const result = await cart.onRemoveItem( uuid );

					if ( item ) {
						events.onNamePulseTracksEvent( 'remove_button_click', {
							domain_name: `${ item.domain }.${ item.tld }`,
							remove_source: 'cart',
							is_bundle: Boolean( item.bundle ),
						} );
					}

					return result;
				},
				...( onRemoveBundle && {
					onRemoveBundle: async ( groupId: string ) => {
						const result = await onRemoveBundle( groupId );

						events.onNamePulseTracksEvent( 'remove_button_click', {
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
