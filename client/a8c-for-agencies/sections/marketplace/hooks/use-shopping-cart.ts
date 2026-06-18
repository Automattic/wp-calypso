import { isEnabled } from '@automattic/calypso-config';
import { getQueryArg } from '@wordpress/url';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { MarketplaceTypeContext, TermPricingContext } from '../context';
import { getPressableMemoryTarget, isPressablePhpMemoryAddon } from '../lib/pressable-memory-addon';
import { CART_URL_HASH_FRAGMENT } from '../shopping-cart';
import { type ShoppingCartItem } from '../types';

const SELECTED_ITEMS_SESSION_STORAGE_KEY = 'shopping-card-selected-items';
const SELECTED_ITEMS_SESSION_STORAGE_KEY_REFERRAL = 'referrals-shopping-card-selected-items';

function serializeCartItem( item: ShoppingCartItem ) {
	const siteUrls = encodeURIComponent( item.siteUrls?.join( ',' ) ?? '' );
	const siteDomain = encodeURIComponent( getPressableMemoryTarget( item ) );

	if ( item.licenseId ) {
		const cachedItem = `${ item.slug }:${ item.quantity }:${ item.licenseId }:${ siteUrls }`;

		return item.site_domain ? `${ cachedItem }:${ siteDomain }` : cachedItem;
	}

	return isPressablePhpMemoryAddon( item )
		? `${ item.slug }:${ item.quantity }::${ siteUrls }:${ siteDomain }`
		: `${ item.slug }:${ item.quantity }`;
}

export default function useShoppingCart() {
	const dispatch = useDispatch();

	const [ selectedCartItems, setSelectedCartItems ] = useState< ShoppingCartItem[] >( [] );
	const { marketplaceType } = useContext( MarketplaceTypeContext );
	const { termPricing } = useContext( TermPricingContext );

	const [ showCart, setShowCart ] = useState( window.location.hash === CART_URL_HASH_FRAGMENT );

	const storageKey = useMemo( () => {
		return marketplaceType === 'regular'
			? SELECTED_ITEMS_SESSION_STORAGE_KEY
			: SELECTED_ITEMS_SESSION_STORAGE_KEY_REFERRAL;
	}, [ marketplaceType ] );

	const toggleCart = () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_marketplace_toggle_cart', {
				purchase_mode: marketplaceType,
				term_pricing: termPricing,
			} )
		);
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
						...( cacheData[ 2 ] ? { licenseId: parseInt( cacheData[ 2 ] ) } : {} ),
						...( cacheData[ 3 ]
							? { siteUrls: decodeURIComponent( cacheData[ 3 ] ).split( ',' ) }
							: {} ),
						...( cacheData[ 4 ] ? { site_domain: decodeURIComponent( cacheData[ 4 ] ) } : {} ),
					};
				} ) ?? [];

		if ( data && !! selectedItemsCache.length ) {
			const loadedItems: ShoppingCartItem[] = [];

			selectedItemsCache.forEach( ( { slug, quantity, licenseId, siteUrls, site_domain } ) => {
				const cachedPressableMemoryTarget = getPressableMemoryTarget( { site_domain } );
				const match =
					quantity === 1 || slug.startsWith( 'wpcom-hosting' )
						? data.find(
								( product ) =>
									product.slug === slug &&
									( ! isPressablePhpMemoryAddon( product ) ||
										getPressableMemoryTarget( product ) === cachedPressableMemoryTarget )
						  )
						: data.find(
								( product ) =>
									product.slug === slug &&
									product.supported_bundles.some( ( bundle ) => bundle.quantity === quantity )
						  );

				if ( match ) {
					loadedItems.push( { ...match, quantity, licenseId, siteUrls, site_domain } );
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
				items.map( ( item ) => serializeCartItem( item ) ).join( ',' )
			);
			setSelectedCartItems( items );
		},
		[ storageKey ]
	);

	const isTermPricingEnabled = isEnabled( 'a4a-bd-term-pricing' ) && isEnabled( 'a4a-bd-checkout' );

	const updatedSelectedCartItems = useMemo( () => {
		return selectedCartItems.map( ( item ) => {
			const termBasedProductId =
				( termPricing === 'yearly' ? item.yearly_product_id : item.monthly_product_id ) ||
				item.product_id;
			const termBasedAlternativeProductId =
				( termPricing === 'yearly'
					? item.yearly_alternative_product_id
					: item.monthly_alternative_product_id ) || item.alternative_product_id;
			return {
				...item,
				product_id: isTermPricingEnabled ? termBasedProductId : item.product_id,
				alternative_product_id: isTermPricingEnabled
					? termBasedAlternativeProductId
					: item.alternative_product_id,
			};
		} );
	}, [ isTermPricingEnabled, selectedCartItems, termPricing ] );

	const onRemoveCartItem = useCallback(
		( item: ShoppingCartItem ) => {
			setAndCacheSelectedItems(
				updatedSelectedCartItems.filter( ( selectedCartItem ) => selectedCartItem !== item )
			);
		},
		[ updatedSelectedCartItems, setAndCacheSelectedItems ]
	);

	const onClearCart = useCallback( () => {
		setAndCacheSelectedItems( [] );
	}, [ setAndCacheSelectedItems ] );

	return {
		selectedCartItems: updatedSelectedCartItems,
		setSelectedCartItems: setAndCacheSelectedItems,
		onRemoveCartItem,
		onClearCart,
		showCart,
		setShowCart,
		toggleCart,
	};
}
