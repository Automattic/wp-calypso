import { useState, useEffect, useCallback } from 'react';

const TTL_DURATION = 300000; // 5 minutes in miliseconds

type ProvisioningSite = {
	id: number;
	migration?: boolean;
	development?: boolean;
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

	const trackSiteId = useCallback(
		(
			siteId: number,
			{ migration, development }: { migration?: boolean; development?: boolean } = {}
		) => {
			setProvisioningSites( ( prevSites ) => {
				const updatedSites = [
					...prevSites,
					{ id: siteId, migration, development, ttl: new Date().getTime() + TTL_DURATION },
				];

				localStorage.setItem( 'provisioningSites', JSON.stringify( updatedSites ) );
				return updatedSites;
			} );
		},
		[]
	);

	return {
		trackSiteId,
		provisioningSites,
	};
}
