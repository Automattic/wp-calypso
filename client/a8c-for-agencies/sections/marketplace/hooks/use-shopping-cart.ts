import { getQueryArg } from '@wordpress/url';
import { useCallback, useEffect, useState } from 'react';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { ShoppingCartItem } from '../types';

const SELECTED_ITEMS_SESSION_STORAGE_KEY = 'shopping-card-selected-items';

export default function useShoppingCart() {
	const [ selectedItems, setSelectedItems ] = useState< ShoppingCartItem[] >( [] );

	const { data } = useProductsQuery( true );

	useEffect( () => {
		const hasSuggestedProductSlug = getQueryArg( window.location.href, 'product_slug' )
			?.toString()
			.split( ',' );

		// If there is suggested product slug from URL, we will need to clear our cache to
		// reflect the suggested pre-selected items.
		if ( hasSuggestedProductSlug ) {
			sessionStorage.removeItem( SELECTED_ITEMS_SESSION_STORAGE_KEY );
		}

		const selectedItemsCache =
			sessionStorage
				.getItem( SELECTED_ITEMS_SESSION_STORAGE_KEY )
				?.split( ',' )
				.map( ( item ) => {
					const cacheData = item.split( ':' );
					return {
						slug: cacheData[ 0 ],
						quantity: parseInt( cacheData[ 1 ] ),
					};
				} ) ?? [];

		if ( data && !! selectedItemsCache.length ) {
			const loadedItems: ShoppingCartItem[] = [];

			data.forEach( ( product ) => {
				const match = selectedItemsCache.find( ( { slug, quantity } ) => {
					return (
						product.slug === slug &&
						( quantity === 1 ||
							product.supported_bundles.map( ( bundle ) => bundle.quantity ).includes( quantity ) )
					);
				} );

				if ( match ) {
					loadedItems.push( { ...product, quantity: match.quantity } );
				}
			} );

			setSelectedItems( loadedItems );
		}
	}, [ data ] );

	const setAndCacheSelectedItems = useCallback( ( items: ShoppingCartItem[] ) => {
		sessionStorage.setItem(
			SELECTED_ITEMS_SESSION_STORAGE_KEY,
			items.map( ( item ) => `${ item.slug }:${ item.quantity }` ).join( ',' )
		);
		setSelectedItems( items );
	}, [] );

	return {
		selectedItems,
		setSelectedItems: setAndCacheSelectedItems,
	};
}
