import { localizeUrl } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { preventWidows } from 'calypso/lib/formatting';
import { toggleUpsellModal } from 'calypso/state/stats/paid-stats-upsell/actions';
import { SUPPORT_URL } from '../const';
import {
	STATS_FEATURE_DATE_CONTROL,
	STATS_FEATURE_UTM_STATS,
	STATS_TYPE_DEVICE_STATS,
	STAT_TYPE_CLICKS,
	STAT_TYPE_COUNTRY_VIEWS,
	STAT_TYPE_FILE_DOWNLOADS,
	STAT_TYPE_REFERRERS,
	STAT_TYPE_SEARCH_TERMS,
	STAT_TYPE_TOP_AUTHORS,
	STAT_TYPE_TOP_POSTS,
	STAT_TYPE_VIDEO_PLAYS,
} from '../constants';
import StatsCardUpsellOverlay from './stats-card-upsell-overlay';
import { Props } from '.';

import './style.scss';

const getUpsellCopy = ( statType: string ) => {
	switch ( statType ) {
		case STAT_TYPE_CLICKS:
			return translate(
				'Learn what {{link}}external links{{/link}} your visitors click on your site to reveal their areas of interest.',
				{
					components: {
						link: (
							<a
								href={ localizeUrl( `${ SUPPORT_URL }#clicks` ) }
								target="_blank"
								rel="noreferrer"
							/>
						),
					},
				}
			);
		case STAT_TYPE_COUNTRY_VIEWS:
			return translate(
				'Discover where your {{link}}visitors are located{{/link}} and identify where your traffic is coming from.',
				{
					components: {
						link: (
							<a
								href={ localizeUrl( `${ SUPPORT_URL }#countries` ) }
								target="_blank"
								rel="noreferrer"
							/>
						),
					},
				}
			);
		case STAT_TYPE_FILE_DOWNLOADS:
			return translate( 'Discover the most {{link}}downloaded files{{/link}} by your visitors.', {
				components: {
					link: (
						<a
							href={ localizeUrl( `${ SUPPORT_URL }#file-downloads` ) }
							target="_blank"
							rel="noreferrer"
						/>
					),
				},
			} );
		case STAT_TYPE_REFERRERS:
			return translate(
				'Find out where your {{link}}visitors come from{{/link}} to optimize your content strategy.',
				{
					components: {
						link: (
							<a
								href={ localizeUrl( `${ SUPPORT_URL }#referrers` ) }
								target="_blank"
								rel="noreferrer"
							/>
						),
					},
				}
			);
		case STAT_TYPE_SEARCH_TERMS:
			return translate(
				'Discover the {{link}}terms and phrases{{/link}} your visitors use to find your site.',
				{
					components: {
						link: (
							<a
								href={ localizeUrl( `${ SUPPORT_URL }#search-terms` ) }
								target="_blank"
								rel="noreferrer"
							/>
						),
					},
				}
			);
		case STAT_TYPE_TOP_AUTHORS:
			return translate(
				'Identify your audience’s {{link}}favorite writers{{/link}} and perspectives.',
				{
					components: {
						link: (
							<a
								href={ localizeUrl( `${ SUPPORT_URL }#authors` ) }
								target="_blank"
								rel="noreferrer"
							/>
						),
					},
				}
			);
		case STAT_TYPE_TOP_POSTS:
			return translate(
				'Discover your {{link}}post and pages{{/link}} traffic in detail and learn what content resonates the most.',
				{
					components: {
						link: (
							<a
								href={ localizeUrl( `${ SUPPORT_URL }#posts-amp-pages` ) }
								target="_blank"
								rel="noreferrer"
							/>
						),
					},
				}
			);
		case STAT_TYPE_VIDEO_PLAYS:
			return translate(
				'Discover your {{link}}most popular videos{{/link}} and find out how they performed.',
				{
					components: {
						link: (
							<a
								href={ localizeUrl( `${ SUPPORT_URL }#videos` ) }
								target="_blank"
								rel="noreferrer"
							/>
						),
					},
				}
			);
		case STATS_FEATURE_DATE_CONTROL:
			return translate( 'Compare different time periods to analyze your site’s growth.' );
		case STATS_FEATURE_UTM_STATS:
			return translate(
				'Generate UTM parameters and track your {{link}}campaign performance data{{/link}}.',
				{
					components: {
						link: (
							<a href={ localizeUrl( `${ SUPPORT_URL }#utm` ) } target="_blank" rel="noreferrer" />
						),
					},
				}
			);
		case STATS_TYPE_DEVICE_STATS:
			return translate(
				'See which {{link}}devices, browsers and OS{{/link}} your visitors are using.',
				{
					components: {
						link: (
							<a
								href={ localizeUrl( `${ SUPPORT_URL }#devices` ) }
								target="_blank"
								rel="noreferrer"
							/>
						),
					},
				}
			);
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
