import { useCallback, useSyncExternalStore } from 'react';
import { useMarketplaceType } from '../use-marketplace-type';
import type { MarketplaceType } from '../use-marketplace-type';

export interface ShoppingCartItem {
	slug: string;
	quantity: number;
	/** The stored entry, kept verbatim so classic's extra fields survive a rewrite. */
	raw?: string;
}

// Same keys and `slug:quantity` format as the classic marketplace cart, which
// may append a license id and site targets for its own flows.
const STORAGE_KEYS: Record< MarketplaceType, string > = {
	regular: 'shopping-card-selected-items',
	referral: 'referrals-shopping-card-selected-items',
};

const listeners = new Set< () => void >();
const snapshots = new Map< MarketplaceType, ShoppingCartItem[] >();

function readItems( marketplaceType: MarketplaceType ): ShoppingCartItem[] {
	const raw = sessionStorage.getItem( STORAGE_KEYS[ marketplaceType ] );
	if ( ! raw ) {
		return [];
	}
	return raw
		.split( ',' )
		.map( ( entry ) => {
			const [ slug, quantity ] = entry.split( ':' );
			return { slug, quantity: parseInt( quantity, 10 ) || 1, raw: entry };
		} )
		.filter( ( item ) => item.slug );
}

function getSnapshot( marketplaceType: MarketplaceType ): ShoppingCartItem[] {
	if ( ! snapshots.has( marketplaceType ) ) {
		snapshots.set( marketplaceType, readItems( marketplaceType ) );
	}
	return snapshots.get( marketplaceType ) as ShoppingCartItem[];
}

function writeItems( marketplaceType: MarketplaceType, items: ShoppingCartItem[] ) {
	if ( items.length === 0 ) {
		sessionStorage.removeItem( STORAGE_KEYS[ marketplaceType ] );
	} else {
		sessionStorage.setItem(
			STORAGE_KEYS[ marketplaceType ],
			items.map( ( item ) => item.raw ?? `${ item.slug }:${ item.quantity }` ).join( ',' )
		);
	}
	snapshots.set( marketplaceType, items );
	listeners.forEach( ( listener ) => listener() );
}

function subscribe( listener: () => void ) {
	listeners.add( listener );
	return () => {
		listeners.delete( listener );
	};
}

export function useShoppingCart() {
	const { marketplaceType } = useMarketplaceType();
	const items = useSyncExternalStore( subscribe, () => getSnapshot( marketplaceType ) );

	const hasItem = useCallback(
		( slug: string ) => items.some( ( item ) => item.slug === slug ),
		[ items ]
	);

	const addItem = useCallback(
		( slug: string ) => {
			const current = getSnapshot( marketplaceType );
			if ( ! current.some( ( item ) => item.slug === slug ) ) {
				writeItems( marketplaceType, [ ...current, { slug, quantity: 1 } ] );
			}
		},
		[ marketplaceType ]
	);

	const removeItem = useCallback(
		( slug: string ) => {
			writeItems(
				marketplaceType,
				getSnapshot( marketplaceType ).filter( ( item ) => item.slug !== slug )
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
