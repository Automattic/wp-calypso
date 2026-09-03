/**
 * This is a Odyssey implementation of 'calypso/components/data/query-site-features'.
 */
import { isError } from '@automattic/js-utils';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from 'calypso/my-sites/stats/hooks/default-query-params';
import { SITE_FEATURES_FETCH, SITE_FEATURES_FETCH_FAILED } from 'calypso/state/action-types';
import { fetchSiteFeaturesCompleted } from 'calypso/state/sites/features/actions';
import config from '../lib/config-api';
import { getApiNamespace, getApiPath } from '../lib/get-api';

type SiteFeatures = { active: string[]; available: Record< string, string[] > };

/**
 * Jetpack proxies WPCOM's `/sites/:id/features` as `jetpack/v4/site/features`, with the body as a
 * JSON string under `data`. A Simple site's wp-admin asks WPCOM directly and gets the object.
 */
export function querySiteFeatures( siteId: number ): Promise< SiteFeatures | Error > {
	return wpcom.req
		.get( {
			path: getApiPath( '/site/features', { siteId } ),
			apiNamespace: getApiNamespace(),
		} )
		.then( ( response: SiteFeatures | { data?: string } ) =>
			config.isEnabled( 'is_running_in_jetpack_site' ) && 'data' in response
				? JSON.parse( response.data as string )
				: response
		)
		.catch( ( error: Error ) => error );
}

/**
 * Fetch the site's plan features into the Redux store for Odyssey Stats. Takes `siteIds` to stay
 * a drop-in for the Calypso component, but the app only ever has the one site.
 */
export default function OdysseyQuerySiteFeatures( { siteIds }: { siteIds: number[] } ) {
	const siteId = siteIds[ 0 ] ?? null;
	const dispatch = useDispatch();
	const {
		data: features,
		isFetching,
		isError: hasQueryError,
	} = useQuery( {
		...getDefaultQueryParams< SiteFeatures | Error >(),
		queryKey: [ 'odyssey-stats', 'site-features', siteId ],
		queryFn: () => querySiteFeatures( siteId as number ),
		enabled: !! siteId,
		retry: false,
	} );

	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		if ( isFetching ) {
			dispatch( { type: SITE_FEATURES_FETCH, siteId } );
			return;
		}

		if ( hasQueryError || isError( features ) || ! features ) {
			dispatch( { type: SITE_FEATURES_FETCH_FAILED, siteId, error: 'features_fetch_failed' } );
			return;
		}

		dispatch( fetchSiteFeaturesCompleted( siteId, features ) );
	}, [ dispatch, siteId, features, isFetching, hasQueryError ] );

	return null;
}
