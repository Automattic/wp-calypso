import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import StatsCardUpsellOverlay from './stats-card-upsell-overlay';

interface Props {
	className: string;
	statType: string;
	siteSlug: string;
	buttonLabel?: string;
}

// TODO: avoid making UTM call and show a ghost element instead
const StatsCardUpsellJetpack: React.FC< Props > = ( { className, siteSlug, buttonLabel } ) => {
	const translate = useTranslate();
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const copyText = translate( 'Track your campaign performance data with UTM codes. Learn more' );

	const onClick = () => {
		// We need to ensure we pass the irclick id for impact affiliate tracking if its set.
		const currentParams = new URLSearchParams( window.location.search );
		const queryParams = new URLSearchParams();

		queryParams.set( 'productType', 'commercial' );
		if ( currentParams.has( 'irclickid' ) ) {
			queryParams.set( 'irclickid', currentParams.get( 'irclickid' ) || '' );
		}

		// publish an event
		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
		recordTracksEvent( `${ event_from }_stats_utm_upgrade_clicked` );

		// redirect to the Purchase page
		setTimeout(
			() => page.redirect( `/stats/purchase/${ siteSlug }?${ queryParams.toString() }` ),
			250
		);
	};

	return (
		<StatsCardUpsellOverlay
			className={ className }
			onClick={ onClick }
			copyText={ copyText }
			buttonLabel={ buttonLabel }
		/>
	);
};

export default StatsCardUpsellJetpack;
