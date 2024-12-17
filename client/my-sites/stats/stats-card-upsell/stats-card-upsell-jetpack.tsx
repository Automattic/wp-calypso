import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useSelector } from 'calypso/state';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { trackStatsAnalyticsEvent } from '../utils';
import StatsCardUpsellOverlay from './stats-card-upsell-overlay';
import getUpsellCopy from './stats-upsell-copy';
import { Props } from './';

const StatsCardUpsellJetpack: React.FC< Props > = ( { className, siteId, statType } ) => {
	const translate = useTranslate();
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const copyText = getUpsellCopy( statType );

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
					{ translate( 'Upgrade to Commercial' ) }
				</Button>
			}
		/>
	);
};

export default StatsCardUpsellJetpack;
