import { useState, useEffect, useCallback } from 'react';

const TTL_DURATION = 300000; // 5 minutes in miliseconds

type ProvisioningSite = {
	id: number;
	migration?: boolean;
	ttl: number;
};

export default function useTrackProvisioningSites() {
	const [ provisioningSites, setProvisioningSites ] = useState< ProvisioningSite[] >( [] );

	useEffect( () => {
		const storedSites = localStorage.getItem( 'provisioningSites' );
		if ( storedSites ) {
			setProvisioningSites( JSON.parse( storedSites ) );
		}
	}, [] );

	const trackSiteId = useCallback( ( siteId: number, migration?: boolean ) => {
		setProvisioningSites( ( prevSites ) => {
			const updatedSites = [
				...prevSites,
				{ id: siteId, migration, ttl: new Date().getTime() + TTL_DURATION },
			];

			localStorage.setItem( 'provisioningSites', JSON.stringify( updatedSites ) );
			return updatedSites;
		} );
	}, [] );

	return {
		trackSiteId,
		provisioningSites,
	};
}
