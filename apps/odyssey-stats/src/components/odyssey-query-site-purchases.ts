/**
 * This is a Odyssey implementation of 'calypso/components/data/query-site-purchases'.
 */
import { APIError } from '@automattic/data-stores';
import { useQuery } from '@tanstack/react-query';
import { isError } from 'lodash';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from 'calypso/my-sites/stats/hooks/default-query-params';
import { useSelector } from 'calypso/state';
import {
	PURCHASES_SITE_FETCH,
	PURCHASES_SITE_FETCH_COMPLETED,
	PURCHASES_SITE_FETCH_FAILED,
} from 'calypso/state/action-types';
import getEnvStatsFeatureSupportChecks from 'calypso/state/sites/selectors/get-env-stats-feature-supports';
import { getApiNamespace, getApiPath } from '../lib/get-api';

async function queryOdysseyQuerySitePurchases(
	siteId: number | null,
	shouldUseStatsBuiltInPurchasesApi: boolean
) {
	if ( ! siteId ) {
		return;
	}

	const apiPath = shouldUseStatsBuiltInPurchasesApi
		? `/sites/${ siteId }/purchases`
		: '/site/purchases';

	return (
		wpcom.req
			.get( {
				path: getApiPath( apiPath, { siteId } ),
				apiNamespace: getApiNamespace(),
			} )
			// Endpoint `site/purchases` returns a stringified JSON object as data.
			// Our own endpoint `/sites/${ siteId }/purchases` returns a JSON object.
			.then( ( res: { data: string } ) => ( res?.data ? JSON.parse( res.data ) : res ) )
			.catch( ( error: APIError ) => error )
	);
}
/**
 * Update site products in the Redux store by fetching purchases via API for Odyssey Stats.
 */

const useOdysseyQuerySitePurchases = (
	siteId: number | null,
	shouldUseStatsBuiltInPurchasesApi = false
) => {
	return useQuery( {
		...getDefaultQueryParams(),
		queryKey: [ 'odyssey-stats', 'site-purchases', siteId ],
		queryFn: () => queryOdysseyQuerySitePurchases( siteId, shouldUseStatsBuiltInPurchasesApi ),
		staleTime: 10 * 1000,
		// If the module is not active, we don't want to retry the query.
		retry: false,
	} );
};

export default function OdysseyQuerySitePurchases( { siteId }: { siteId: number | null } ) {
	const { shouldUseStatsBuiltInPurchasesApi } = useSelector( ( state ) =>
		getEnvStatsFeatureSupportChecks( state, siteId )
	);
	const {
		data: purchases,
		isFetching,
		isError: hasOtherErrors,
	} = useOdysseyQuerySitePurchases( siteId, shouldUseStatsBuiltInPurchasesApi );
	const reduxDispatch = useDispatch();

	useEffect( () => {
		// Dispatch evet marking as requesting
		reduxDispatch( {
			type: PURCHASES_SITE_FETCH,
			siteId,
		} );

		if ( isFetching ) {
			return;
		}

		if ( isError( purchases ) || hasOtherErrors ) {
			// As `site/purchases` are still in use for legacy versions, so we still need to feed it with data.
			if ( ( purchases as APIError ).status !== 403 ) {
				// Dispatch to the Purchases reducer for error status
				reduxDispatch( {
					type: PURCHASES_SITE_FETCH_FAILED,
					error: 'purchase_fetch_failed',
				} );
			} else {
				// TODO: Remove this after fixing the API permission issue from Jetpack.
				reduxDispatch( {
					type: PURCHASES_SITE_FETCH_COMPLETED,
					siteId,
					purchases: [
						{
							expiry_status: 'active',
							product_slug: 'jetpack_stats_pwyw_yearly',
							blog_id: siteId,
						},
					],
				} );
			}
		} else {
			// Dispatch to the Purchases reducer for consistent requesting status
			reduxDispatch( {
				type: PURCHASES_SITE_FETCH_COMPLETED,
				siteId,
				purchases: purchases,
			} );
		}
	}, [ purchases, isFetching, reduxDispatch, hasOtherErrors, siteId ] );

	return null;
}
