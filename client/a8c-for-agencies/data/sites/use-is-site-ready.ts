import { useEffect, useState } from 'react';
import useFetchActiveSites from './use-fetch-active-sites';

type Props = {
	siteId: number;
};

type Site = {
	id: number;
	url: string;
	features: {
		wpcom_atomic: {
			state: string;
			blog_id: number;
		};
	};
};

export default function useIsSiteReady( { siteId }: Props ) {
	const [ site, setSite ] = useState< Site | null >( null );
	const { data } = useFetchActiveSites( { autoRefresh: ! site } );

	useEffect( () => {
		const match = data?.find(
			( site: Site ) => site.id === siteId && site.features.wpcom_atomic?.state === 'active'
		);

		if ( match ) {
			setSite( match );
		} else {
			setSite( null );
		}
	}, [ data, site, siteId ] );

	return {
		isReady: !! site,
		site,
	};
}
