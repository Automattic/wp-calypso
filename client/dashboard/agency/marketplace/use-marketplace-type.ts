import { useCallback, useSyncExternalStore } from 'react';

export type MarketplaceType = 'regular' | 'referral';

// Shared with the classic A4A marketplace so the selected mode carries over between dashboards.
const SESSION_STORAGE_KEY = 'marketplace-type';

const listeners = new Set< () => void >();

function subscribe( listener: () => void ) {
	listeners.add( listener );
	return () => {
		listeners.delete( listener );
	};
}

function getSnapshot(): MarketplaceType {
	return ( sessionStorage.getItem( SESSION_STORAGE_KEY ) as MarketplaceType | null ) ?? 'regular';
}

export function useMarketplaceType() {
	const marketplaceType = useSyncExternalStore( subscribe, getSnapshot );

	const updateMarketplaceType = useCallback( ( type: MarketplaceType ) => {
		sessionStorage.setItem( SESSION_STORAGE_KEY, type );
		listeners.forEach( ( listener ) => listener() );
	}, [] );

	return { marketplaceType, updateMarketplaceType };
}
