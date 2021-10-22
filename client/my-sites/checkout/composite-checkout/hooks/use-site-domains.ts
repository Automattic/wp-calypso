import debugFactory from 'debug';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSiteDomains } from 'calypso/state/sites/domains/actions';
import { getDomainsBySiteId, hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';
import type { Domain } from '@automattic/data-stores';

const debug = debugFactory( 'calypso:composite-checkout:use-site-domains' );

export default function useSiteDomains( siteId: number | undefined ): Domain[] {
	const dispatch = useDispatch();

	const [ siteDomains, setSiteDomains ] = useState( [] );

	const areDomainsLoaded = useSelector( ( state ) => hasLoadedSiteDomains( state, siteId ) );

	const domains = useSelector(
		( state ) => areDomainsLoaded && getDomainsBySiteId( state, siteId )
	);

	useEffect( () => {
		if ( areDomainsLoaded ) {
			debug( 'Setting list of domains', domains );

			setSiteDomains( domains );
		} else {
			debug( 'Fetching list of domains' );

			dispatch( fetchSiteDomains( siteId ) );
		}
	}, [ areDomainsLoaded, dispatch, domains, siteId ] );

	return siteDomains;
}
