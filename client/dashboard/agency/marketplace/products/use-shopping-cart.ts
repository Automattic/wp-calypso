import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { useMarketplaceType } from '../use-marketplace-type';
import { decodeSiteDomain, getPressableMemoryTarget } from './lib/pressable-memory-addon';
import type { MarketplaceType } from '../use-marketplace-type';
import type { AgencyProduct } from '@automattic/api-core';

export interface ShoppingCartItem {
	slug: string;
	quantity: number;
	/** The Pressable site a PHP memory add-on applies to. */
	siteDomain?: string;
	/** The stored entry, kept verbatim so classic's extra fields survive a rewrite. */
	raw?: string;
}

/** What tells one cart line from another: the product, and for a PHP memory add-on its site. */
export type CartItemRef = Pick< ShoppingCartItem, 'slug' | 'siteDomain' >;

export function getProductCartRef( product: AgencyProduct ): CartItemRef {
	return { slug: product.slug, siteDomain: getPressableMemoryTarget( product ) };
}

const isSameItem = ( a: CartItemRef, b: CartItemRef ) =>
	a.slug === b.slug && ( a.siteDomain ?? '' ) === ( b.siteDomain ?? '' );

// Same keys and `slug:quantity` format as the classic marketplace cart, which
// may append a license id and site targets for its own flows. A PHP memory
// add-on carries its site in the fifth field, `slug:quantity:::domain`, as
// classic writes it.
const STORAGE_KEYS: Record< MarketplaceType, string > = {
	regular: 'shopping-card-selected-items',
	referral: 'referrals-shopping-card-selected-items',
};

/** The most units of one product a cart line can hold. */
export const MAX_CART_ITEM_QUANTITY = 100;

const listeners = new Set< () => void >();
const snapshots = new Map< MarketplaceType, ShoppingCartItem[] >();

// Parses classic's `slug:quantity,slug:quantity` list, from storage or a deep link.
export function parseCartEntries( entries: string ): ShoppingCartItem[] {
	if ( ! entries ) {
		return [];
	}
	return entries
		.split( ',' )
		.map( ( entry ) => {
			const [ slug, quantity, , , encodedSiteDomain ] = entry.split( ':' );
			const siteDomain = decodeSiteDomain( encodedSiteDomain );
			return {
				slug,
				quantity: Math.min( MAX_CART_ITEM_QUANTITY, parseInt( quantity, 10 ) || 1 ),
				...( siteDomain ? { siteDomain } : {} ),
				raw: entry,
			};
		} )
		.filter( ( item ) => item.slug );
}

function readItems( marketplaceType: MarketplaceType ): ShoppingCartItem[] {
	return parseCartEntries( sessionStorage.getItem( STORAGE_KEYS[ marketplaceType ] ) ?? '' );
}

function getSnapshot( marketplaceType: MarketplaceType ): ShoppingCartItem[] {
	if ( ! snapshots.has( marketplaceType ) ) {
		snapshots.set( marketplaceType, readItems( marketplaceType ) );
	}
	return snapshots.get( marketplaceType ) as ShoppingCartItem[];
}

function serializeItem( item: ShoppingCartItem ): string {
	if ( item.raw ) {
		return item.raw;
	}
	return item.siteDomain
		? `${ item.slug }:${ item.quantity }:::${ encodeURIComponent( item.siteDomain ) }`
		: `${ item.slug }:${ item.quantity }`;
}

function writeItems( marketplaceType: MarketplaceType, items: ShoppingCartItem[] ) {
	if ( items.length === 0 ) {
		sessionStorage.removeItem( STORAGE_KEYS[ marketplaceType ] );
	} else {
		sessionStorage.setItem(
			STORAGE_KEYS[ marketplaceType ],
			items.map( serializeItem ).join( ',' )
		);
	}
	snapshots.set( marketplaceType, items );
	listeners.forEach( ( listener ) => listener() );
}

/** Empties the stored cart outside React, for the page a finished checkout returns to. */
export function clearStoredCart( marketplaceType: MarketplaceType ) {
	writeItems( marketplaceType, [] );
}

function subscribe( listener: () => void ) {
	listeners.add( listener );
	return () => {
		listeners.delete( listener );
	};
}

/**
 * The cart of the current marketplace mode, or of `type` for a page that
 * belongs to one mode whatever the toggle says.
 */
export function useShoppingCart( type?: MarketplaceType ) {
	const { marketplaceType: currentType } = useMarketplaceType();
	const marketplaceType = type ?? currentType;
	const items = useSyncExternalStore( subscribe, () => getSnapshot( marketplaceType ) );

	const hasItem = useCallback(
		( ref: CartItemRef ) => items.some( ( item ) => isSameItem( item, ref ) ),
		[ items ]
	);

	const addItem = useCallback(
		( { slug, siteDomain }: CartItemRef ) => {
			const current = getSnapshot( marketplaceType );
			if ( ! current.some( ( item ) => isSameItem( item, { slug, siteDomain } ) ) ) {
				writeItems( marketplaceType, [
					...current,
					{ slug, quantity: 1, ...( siteDomain ? { siteDomain } : {} ) },
				] );
			}
		},
		[ marketplaceType ]
	);

	const removeItem = useCallback(
		( ref: CartItemRef ) => {
			writeItems(
				marketplaceType,
				getSnapshot( marketplaceType ).filter( ( item ) => ! isSameItem( item, ref ) )
			);
		},
		[ marketplaceType ]
	);

	const replaceItems = useCallback(
		( nextItems: ShoppingCartItem[] ) => writeItems( marketplaceType, nextItems ),
		[ marketplaceType ]
	);

	// Puts `item` in the cart in place of any items with the given slugs, the
	// way a hosting plan replaces the plan of the same family already in it.
	const swapItems = useCallback(
		( slugsToRemove: string[], item: ShoppingCartItem ) => {
			const remaining = getSnapshot( marketplaceType ).filter(
				( current ) => current.slug !== item.slug && ! slugsToRemove.includes( current.slug )
			);
			writeItems( marketplaceType, [ ...remaining, item ] );
		},
		[ marketplaceType ]
	);

	const clearCart = useCallback( () => writeItems( marketplaceType, [] ), [ marketplaceType ] );

	return { items, hasItem, addItem, removeItem, replaceItems, swapItems, clearCart };
}

// Classic links open the cart with a `#cart` hash, e.g. from a "View cart" notice.
const CART_HASH = '#cart';

export function useCartOpen() {
	const [ isCartOpen, setIsCartOpen ] = useState( () => window.location.hash === CART_HASH );

	useEffect( () => {
		if ( window.location.hash === CART_HASH ) {
			window.history.replaceState( null, '', window.location.pathname + window.location.search );
		}
	}, [] );

	return [ isCartOpen, setIsCartOpen ] as const;
}
