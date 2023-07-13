import config from '@automattic/calypso-config';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import version_compare from 'calypso/lib/version-compare';
import wpcom from 'calypso/lib/wp';
import { SITE_PURCHASES_UPDATE } from 'calypso/state/action-types';
import getJetpackStatsAdminVersion from 'calypso/state/sites/selectors/get-jetpack-stats-admin-version';
import hasSiteProductJetpackStatsPaid from 'calypso/state/sites/selectors/has-site-product-jetpack-stats-paid';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import DoYouLoveJetpackStatsNotice from './do-you-love-jetpack-stats-notice';
import FeedbackNotice from './feedback-notice';
import LegacyStatsNotices from './legacy-notices';
import OptOutNotice from './opt-out-notice';
import { StatsNoticesProps } from './types';
import type { RawSiteProduct } from 'calypso/state/sites/selectors/get-site-products';

import './style.scss';

const formatPurchasesToSiteProducts = (
	purchases: Record< string, string >[]
): RawSiteProduct[] => {
	return purchases.map( ( purchase ) => ( {
		product_id: purchase.product_id,
		product_slug: purchase.product_slug,
		product_name: purchase.product_name,
		// `product_name_short`, `expired`, and `user_is_owner` are not available in the purchase object.
		product_name_short: purchase.product_name_short || null,
		expired: !! purchase.expired,
		user_is_owner: !! purchase.user_is_owner,
	} ) );
};

/**
 * New notices aim to support Calypso and Odyssey stats.
 * New notices are based on async API call and hence is faster than the old notices.
 */
const NewStatsNotices = ( { siteId, isOdysseyStats }: StatsNoticesProps ) => {
	const hasPaidStats = useSelector( ( state ) => hasSiteProductJetpackStatsPaid( state, siteId ) );
	const isSiteJetpackNotAtomic = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } )
	);

	const reduxDispatch = useDispatch();
	// TODO: Display error messages on the notice.
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [ error, setError ] = useState< Error | null >( null );
	const [ hasLoadedPurchases, setHasLoadedPurchases ] = useState< boolean | undefined >(
		! isOdysseyStats
	);

	// Update site purchases in Redux store for Odyssey Stats.
	useEffect( () => {
		if ( isOdysseyStats ) {
			wpcom.req
				.get( { path: '/site/purchases', apiNamespace: 'jetpack/v4' } )
				.then( ( res: { data: string } ) => JSON.parse( res.data ) )
				.then( ( purchases: Record< string, string >[] ) => {
					reduxDispatch( {
						type: SITE_PURCHASES_UPDATE,
						siteId,
						purchases: formatPurchasesToSiteProducts( purchases ),
					} );
				} )
				.catch( ( error: Error ) => setError( error ) )
				.finally( () => setHasLoadedPurchases( true ) );
		}
	}, [ isOdysseyStats, reduxDispatch, siteId ] );

	const showPaidStatsNotice =
		config.isEnabled( 'stats/paid-stats' ) &&
		isSiteJetpackNotAtomic &&
		! hasPaidStats &&
		hasLoadedPurchases;

	return (
		<>
			{ showPaidStatsNotice && <DoYouLoveJetpackStatsNotice siteId={ siteId } /> }
			{ isOdysseyStats && <OptOutNotice siteId={ siteId } /> }
			{ isOdysseyStats && <FeedbackNotice siteId={ siteId } /> }
		</>
	);
};

/**
 * Return new or old StatsNotices components based on env.
 */
export default function StatsNotices( { siteId, isOdysseyStats }: StatsNoticesProps ) {
	const statsAdminVersion = useSelector( ( state: object ) =>
		getJetpackStatsAdminVersion( state, siteId )
	);
	const supportNewStatsNotices =
		! isOdysseyStats ||
		!! ( statsAdminVersion && version_compare( statsAdminVersion, '0.10.0-alpha', '>=' ) );

	return supportNewStatsNotices ? (
		<NewStatsNotices siteId={ siteId } isOdysseyStats={ isOdysseyStats } />
	) : (
		<LegacyStatsNotices siteId={ siteId } />
	);
}
