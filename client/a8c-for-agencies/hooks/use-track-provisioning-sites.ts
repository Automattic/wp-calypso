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

	const reload = useCallback( () => {
		const storedSites = localStorage.getItem( 'provisioningSites' );
		if ( storedSites ) {
			const sites: ProvisioningSite[] = JSON.parse( storedSites );
			// We remove the site from tracking if it is more than 5 minutes.
			const activeSites = sites.filter( ( { ttl } ) => ttl >= new Date().getTime() );

			setProvisioningSites( activeSites );
			localStorage.setItem( 'provisioningSites', JSON.stringify( activeSites ) );
		}
	}, [] );

	const trackSiteId = useCallback(
		(
			siteId: number,
			{ migration, development }: { migration?: boolean; development?: boolean } = {}
		) => {
			const updatedSites = [
				...provisioningSites,
				{ id: siteId, migration, development, ttl: new Date().getTime() + TTL_DURATION },
			];

			localStorage.setItem( 'provisioningSites', JSON.stringify( updatedSites ) );
			window.dispatchEvent( new CustomEvent( 'a4a-provisioning-site-change' ) );
		},
		[ provisioningSites ]
	);

	const untrackSiteId = useCallback(
		( siteId: number ) => {
			const updatedSites = provisioningSites.filter( ( { id } ) => id !== siteId );

			localStorage.setItem( 'provisioningSites', JSON.stringify( updatedSites ) );
			window.dispatchEvent( new CustomEvent( 'a4a-provisioning-site-change' ) );
		},
		[ provisioningSites ]
	);

	useEffect( () => {
		window.addEventListener( 'a4a-provisioning-site-change', reload );
		reload();

		return () => {
			window.removeEventListener( 'a4a-provisioning-site-change', reload );
		};
	}, [ reload ] );

	return {
		trackSiteId,
		untrackSiteId,
		provisioningSites,
	};
}
