import { useCallback, useState } from 'react';

export type MarketplaceType = 'regular' | 'referral';

// Shared with the classic A4A marketplace so the selected mode carries over between dashboards.
const SESSION_STORAGE_KEY = 'marketplace-type';

export function useMarketplaceType() {
	const [ marketplaceType, setMarketplaceType ] = useState< MarketplaceType >(
		() => ( sessionStorage.getItem( SESSION_STORAGE_KEY ) as MarketplaceType | null ) ?? 'regular'
	);

	const updateMarketplaceType = useCallback( ( type: MarketplaceType ) => {
		sessionStorage.setItem( SESSION_STORAGE_KEY, type );
		setMarketplaceType( type );
	}, [] );

	return { marketplaceType, updateMarketplaceType };
}
