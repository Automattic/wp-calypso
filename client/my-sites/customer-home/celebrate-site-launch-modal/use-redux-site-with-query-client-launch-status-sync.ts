import { siteByIdQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { requestSite } from 'calypso/state/sites/actions';
import { getSite } from 'calypso/state/sites/selectors';

/**
 * Syncs the site launch status from the query client to the Redux store.
 *
 * The site launch status is stored in the query client's `site-by-id` cache entry.
 * When the entry is invalidated, the site launch status is not updated in the Redux store.
 * This hook fetches the site from the query client and updates the Redux store with the launch status.
 */
export function useReduxSiteWithQueryClientLaunchStatusSync( siteId: number ) {
	const reduxSite = useSelector( ( state ) => getSite( state, siteId ) );
	const dispatch = useDispatch();

	const { data: site } = useQuery( siteByIdQuery( siteId ) );

	const cachedReduxSiteLaunchStatus = useRef< undefined | string >( undefined );
	cachedReduxSiteLaunchStatus.current = reduxSite?.launch_status;

	useEffect( () => {
		if ( ! site ) {
			return;
		}

		if ( site.launch_status !== cachedReduxSiteLaunchStatus.current ) {
			dispatch( requestSite( siteId ) );
		}
	}, [ site, siteId, dispatch ] );

	return reduxSite;
}
