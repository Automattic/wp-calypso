import debugFactory from 'debug';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchSiteDomains } from 'calypso/state/sites/domains/actions';
import {
	getDomainsBySiteId,
	hasLoadedSiteDomains,
	isRequestingSiteDomains,
} from 'calypso/state/sites/domains/selectors';
import type { ResponseDomain } from 'calypso/lib/domains/types';

const debug = debugFactory( 'calypso:composite-checkout:use-site-domains' );

export default function useSiteDomains( siteId: number | undefined ): ResponseDomain[] {
	const dispatch = useDispatch();

	const areDomainsLoaded = useSelector( ( state ) =>
		siteId ? hasLoadedSiteDomains( state, siteId ) : false
	);
	const domains: ResponseDomain[] = useSelector( ( state ) => getDomainsBySiteId( state, siteId ) );

	useEffect( () => {
		if ( areDomainsLoaded ) {
			return;
		}
		if ( siteId ) {
			dispatch( ( dispatch, getState ) => {
				if ( ! isRequestingSiteDomains( getState(), siteId ) ) {
					debug( 'Fetching list of domains' );
					dispatch( fetchSiteDomains( siteId ) );
				}
			} );
		}
	}, [ areDomainsLoaded, dispatch, siteId ] );

	return domains;
}
