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
		return [];
	}

	const apiPath = shouldUseStatsBuiltInPurchasesApi
		? `/sites/${ siteId }/purchases`
		: '/site/purchases';
	const apiNamespace = shouldUseStatsBuiltInPurchasesApi ? 'jetpack/v4/stats-app' : 'jetpack/v4';

	return (
		wpcom.req
			.get( {
				path: getApiPath( apiPath, { siteId } ),
				apiNamespace: getApiNamespace( apiNamespace ),
			} )
			// Endpoint `site/purchases` returns a stringified JSON object as data.
			// Our own endpoint `/sites/${ siteId }/purchases` returns a JSON object.
			.then( ( res: { data: string } ) => {
				if ( res?.data ) {
					return JSON.parse( res.data );
				}
				return res ? res : [];
			} )
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
		queryKey: [ 'odyssey-stats', 'site-purchases', shouldUseStatsBuiltInPurchasesApi, siteId ],
		queryFn: () => queryOdysseyQuerySitePurchases( siteId, shouldUseStatsBuiltInPurchasesApi ),
		staleTime: 10 * 1000,
		// If the module is not active, we don't want to retry the query.
		retry: false,
	} );
};

async function queryOdysseyQuerySitePurchasesFromMyJetpack(
	siteId: number | null,
	shouldUseStatsBuiltInPurchasesApi: boolean
) {
	if ( ! siteId || shouldUseStatsBuiltInPurchasesApi ) {
		return [];
	}
	return wpcom.req
		.get( {
			path: getApiPath( '/site/purchases', { siteId } ),
			apiNamespace: getApiNamespace( 'my-jetpack/v1' ),
		} )
		.catch( ( error: APIError ) => error );
}
/**
 * Update site products in the Redux store by fetching purchases via API for Odyssey Stats.
 */
const useOdysseyQuerySitePurchasesFromMyJetpack = (
	siteId: number | null,
	shouldUseStatsBuiltInPurchasesApi = false
) => {
	return useQuery( {
		...getDefaultQueryParams< Array< object > >(),
		queryKey: [
			'odyssey-stats',
			'site-purchases',
			'my-jetpack',
			shouldUseStatsBuiltInPurchasesApi,
			siteId,
		],
		queryFn: () =>
			queryOdysseyQuerySitePurchasesFromMyJetpack( siteId, shouldUseStatsBuiltInPurchasesApi ),
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
		isFetching: isFetchingSitePurchases,
		isError: hasOtherErrors,
	} = useOdysseyQuerySitePurchases( siteId, shouldUseStatsBuiltInPurchasesApi );
	const { data: purchasesFromMyJetpack, isFetching: isFetchingSitePurchasesFromMyJetpack } =
		useOdysseyQuerySitePurchasesFromMyJetpack( siteId, shouldUseStatsBuiltInPurchasesApi );
	const isFetching = isFetchingSitePurchases || isFetchingSitePurchasesFromMyJetpack;
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
				if ( purchasesFromMyJetpack && purchasesFromMyJetpack.length > 0 ) {
					// Use My Jetpack response as a fallback.
					reduxDispatch( {
						type: PURCHASES_SITE_FETCH_COMPLETED,
						siteId,
						purchases: purchasesFromMyJetpack,
					} );
					return;
				}
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
				purchases: purchases ?? [],
			} );
		}
	}, [ purchases, isFetching, reduxDispatch, hasOtherErrors, siteId, purchasesFromMyJetpack ] );

	return null;
}
