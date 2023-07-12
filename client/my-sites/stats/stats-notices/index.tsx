import config from '@automattic/calypso-config';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import version_compare from 'calypso/lib/version-compare';
import { SITE_PURCHASES_UPDATE } from 'calypso/state/action-types';
import getJetpackStatsAdminVersion from 'calypso/state/sites/selectors/get-jetpack-stats-admin-version';
import hasSiteProductJetpackStatsPaid from 'calypso/state/sites/selectors/has-site-product-jetpack-stats-paid';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import DoYouLoveJetpackStatsNotice from './do-you-love-jetpack-stats-notice';
import FeedbackNotice from './feedback-notice';
import LegacyStatsNotices from './legacy-notices';
import OptOutNotice from './opt-out-notice';
import { StatsNoticesProps } from './types';

import './style.scss';

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
						purchases: purchases,
					} );
				} )
				.catch( ( error: Error ) => setError( error ) );
		}
	}, [ isOdysseyStats, reduxDispatch, siteId ] );

	return (
		<>
			{ config.isEnabled( 'stats/paid-stats' ) && isSiteJetpackNotAtomic && ! hasPaidStats && (
				<DoYouLoveJetpackStatsNotice siteId={ siteId } />
			) }
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
