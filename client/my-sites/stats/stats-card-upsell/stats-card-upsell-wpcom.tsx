import { translate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { preventWidows } from 'calypso/lib/formatting';
import { toggleUpsellModal } from 'calypso/state/stats/paid-stats-upsell/actions';
import {
	STATS_FEATURE_DATE_CONTROL,
	STATS_FEATURE_UTM_STATS,
	STATS_TYPE_DEVICE_STATS,
	STAT_TYPE_CLICKS,
	STAT_TYPE_REFERRERS,
	STAT_TYPE_SEARCH_TERMS,
	STAT_TYPE_TOP_AUTHORS,
	STAT_TYPE_VIDEO_PLAYS,
} from '../constants';
import StatsCardUpsellOverlay from './stats-card-upsell-overlay';
import { Props } from '.';

import './style.scss';

const getUpsellCopy = ( statType: string ) => {
	switch ( statType ) {
		case STAT_TYPE_REFERRERS:
			return translate(
				'Find out where your visitors come from to optimize your content strategy.'
			);
		case STAT_TYPE_CLICKS:
			return translate(
				'Learn what external links your visitors click on your site to reveal their areas of interest.'
			);
		case STAT_TYPE_SEARCH_TERMS:
			return translate( 'Discover the terms and phrases your visitors use to find your site.' );
		case STAT_TYPE_TOP_AUTHORS:
			return translate( 'Identify your audience’s favorite writers and perspectives.' );
		case STATS_FEATURE_DATE_CONTROL:
			return translate( 'Compare different time periods to analyze your site’s growth.' );
		case STAT_TYPE_VIDEO_PLAYS:
			return translate( 'Discover your most popular videos and find out how they performed.' );
		case STATS_FEATURE_UTM_STATS:
			return translate( 'Generate UTM parameters and track your campaign performance data.' );
		case STATS_TYPE_DEVICE_STATS:
			return translate( 'See which devices your visitors are using.' );
		default:
			return translate( 'Upgrade your plan to unlock Jetpack Stats.' );
	}
};

const StatsCardUpsell: React.FC< Props > = ( { className, statType, siteId, buttonLabel } ) => {
	const dispatch = useDispatch();

	const onClick = ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ) => {
		event.preventDefault();
		dispatch( toggleUpsellModal( siteId, statType ) );
	};

	return (
		<StatsCardUpsellOverlay
			className={ className }
			onClick={ onClick }
			copyText={ preventWidows( getUpsellCopy( statType ) ) }
			buttonLabel={ buttonLabel }
		/>
	);
};

export default StatsCardUpsell;
