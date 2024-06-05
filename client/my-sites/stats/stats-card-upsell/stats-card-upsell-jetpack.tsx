import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { useSelector } from 'calypso/state';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import {
	STATS_FEATURE_DATE_CONTROL,
	STATS_FEATURE_UTM_STATS,
	STATS_TYPE_DEVICE_STATS,
} from '../constants';
import { trackStatsAnalyticsEvent } from '../utils';
import StatsCardUpsellOverlay from './stats-card-upsell-overlay';
import { Props } from './';

const useUpsellCopy = ( statType: string ) => {
	const translate = useTranslate();
	switch ( statType ) {
		case STATS_FEATURE_DATE_CONTROL:
			return translate( 'Compare different time periods to analyze your site’s growth.' );
		case STATS_FEATURE_UTM_STATS:
			return translate(
				'Track your campaign performance data with UTM codes. {{learnMoreLink}}Learn more{{/learnMoreLink}}',
				{
					components: {
						learnMoreLink: <InlineSupportLink supportContext="stats" showIcon={ false } />,
					},
				}
			);
		case STATS_TYPE_DEVICE_STATS:
			return translate(
				'Look at what devices your users are on. {{learnMoreLink}}Learn more{{/learnMoreLink}}',
				{
					components: {
						learnMoreLink: <InlineSupportLink supportContext="stats" showIcon={ false } />,
					},
				}
			);
		default:
			return translate( 'Upgrade to unlock the feature' );
	}
};

const StatsCardUpsellJetpack: React.FC< Props > = ( { className, siteId, statType } ) => {
	const translate = useTranslate();
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const copyText = useUpsellCopy( statType );

	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const isWPCOMSite = useSelector( ( state ) => siteId && getIsSiteWPCOM( state, siteId ) );
	const tracksEvent = `${ statType }_upgrade_clicked`;

	const onClick = () => {
		// We need to ensure we pass the irclick id for impact affiliate tracking if its set.
		const currentParams = new URLSearchParams( window.location.search );
		const queryParams = new URLSearchParams();

		queryParams.set( 'productType', 'commercial' );
		queryParams.set( 'from', `${ tracksEvent }` );
		if ( currentParams.has( 'irclickid' ) ) {
			queryParams.set( 'irclickid', currentParams.get( 'irclickid' ) || '' );
		}

		// publish an event
		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
		recordTracksEvent( `${ event_from }_${ tracksEvent }` );
		// publish new unified upgrade event
		trackStatsAnalyticsEvent( 'stats_upgrade_clicked', {
			type: statType,
		} );

		// redirect to the Purchase page
		setTimeout( () => page( `/stats/purchase/${ siteSlug }?${ queryParams.toString() }` ), 250 );
	};

	return (
		<StatsCardUpsellOverlay
			className={ className }
			onClick={ onClick }
			copyText={ copyText }
			buttonComponent={
				<Button
					className={ clsx( {
						[ 'jetpack-emerald-button' ]: ! isWPCOMSite,
					} ) }
					onClick={ onClick }
					primary
				>
					{ translate( 'Upgrade plan' ) }
				</Button>
			}
		/>
	);
};

export default StatsCardUpsellJetpack;
