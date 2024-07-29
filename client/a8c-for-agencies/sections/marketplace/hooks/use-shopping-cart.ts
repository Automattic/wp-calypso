import { getQueryArg } from '@wordpress/url';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import { MarketplaceTypeContext } from '../context';
import { CART_URL_HASH_FRAGMENT } from '../shopping-cart';
import { type ShoppingCartItem } from '../types';

const SELECTED_ITEMS_SESSION_STORAGE_KEY = 'shopping-card-selected-items';
const SELECTED_ITEMS_SESSION_STORAGE_KEY_REFERRAL = 'referrals-shopping-card-selected-items';

export default function useShoppingCart() {
	const [ selectedCartItems, setSelectedCartItems ] = useState< ShoppingCartItem[] >( [] );
	const { marketplaceType } = useContext( MarketplaceTypeContext );

	const [ showCart, setShowCart ] = useState( window.location.hash === CART_URL_HASH_FRAGMENT );

	const storageKey = useMemo( () => {
		return marketplaceType === 'regular'
			? SELECTED_ITEMS_SESSION_STORAGE_KEY
			: SELECTED_ITEMS_SESSION_STORAGE_KEY_REFERRAL;
	}, [ marketplaceType ] );

	const toggleCart = () => {
		setShowCart( ( prevState ) => {
			const nextState = ! prevState;

			const hashFragment = nextState ? CART_URL_HASH_FRAGMENT : '';

			window.history.replaceState(
				null,
				'',
				window.location.pathname + window.location.search + hashFragment
			);

			return nextState;
		} );
	};

	const { data } = useProductsQuery();

	useEffect( () => {
		const hasSuggestedProductSlug = getQueryArg( window.location.href, 'product_slug' )
			?.toString()
			.split( ',' );

		// If there is suggested product slug from URL, we will need to clear our cache to
		// reflect the suggested pre-selected items.
		if ( hasSuggestedProductSlug ) {
			sessionStorage.removeItem( storageKey );
		}

		const selectedItemsCache =
			sessionStorage
				.getItem( storageKey )
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

			selectedItemsCache.forEach( ( { slug, quantity } ) => {
				const match =
					quantity === 1 || slug.startsWith( 'wpcom-hosting' )
						? data.find( ( product ) => product.slug === slug )
						: data.find(
								( product ) =>
									product.slug === slug &&
									product.supported_bundles.some( ( bundle ) => bundle.quantity === quantity )
						  );

				if ( match ) {
					loadedItems.push( { ...match, quantity } );
				}
			} );

			setSelectedCartItems( loadedItems );
		} else if ( ! selectedItemsCache.length ) {
			setSelectedCartItems( [] );
		}
	}, [ data, storageKey ] );

	const setAndCacheSelectedItems = useCallback(
		( items: ShoppingCartItem[] ) => {
			sessionStorage.setItem(
				storageKey,
				items.map( ( item ) => `${ item.slug }:${ item.quantity }` ).join( ',' )
			);
			setSelectedCartItems( items );
		},
		[ storageKey ]
	);

	const onRemoveCartItem = useCallback(
		( item: ShoppingCartItem ) => {
			setAndCacheSelectedItems(
				selectedCartItems.filter( ( selectedCartItem ) => selectedCartItem !== item )
			);
		},
		[ selectedCartItems, setAndCacheSelectedItems ]
	);

	const onClearCart = useCallback( () => {
		setAndCacheSelectedItems( [] );
	}, [ setAndCacheSelectedItems ] );

	return {
		selectedCartItems,
		setSelectedCartItems: setAndCacheSelectedItems,
		onRemoveCartItem,
		onClearCart,
		showCart,
		setShowCart,
		toggleCart,
	};
}
