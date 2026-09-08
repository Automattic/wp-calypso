import { useEffect, useState } from 'react';
import useFetchActiveSites from './use-fetch-active-sites';

type Props = {
	siteId: number;
};

type Site = {
	id: number;
	url?: string;
	features?: {
		wpcom_atomic?: {
			state?: string;
			blog_id?: number;
		};
	};
};

export default function useIsSiteReady( { siteId }: Props ) {
	const [ site, setSite ] = useState< Site | null >( null );
	const { data } = useFetchActiveSites( { autoRefresh: ! site } );

	useEffect( () => {
		// This banner renders on every /sites load and polls once a second, so a
		// response that isn't the expected list must not take the route down.
		const sites: Site[] = Array.isArray( data ) ? data : [];
		const match = sites.find(
			( site: Site ) => site.id === siteId && site.features?.wpcom_atomic?.state === 'active'
		);

		setSite( match ?? null );
	}, [ data, site, siteId ] );

	return {
		isReady: !! site,
		site,
	};
}
