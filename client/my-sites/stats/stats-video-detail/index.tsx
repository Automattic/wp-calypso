import { useTranslate } from 'i18n-calypso';
import { useEffect, useLayoutEffect, useMemo } from 'react';
import titlecase from 'to-title-case';
import Main from 'calypso/my-sites/stats/components/stats-main';
import {
	useStatsBreadcrumbTrail,
	recordCurrentScreen,
} from 'calypso/my-sites/stats/hooks/use-stats-navigation-history';
import { useSelector } from 'calypso/state';
import {
	getSiteStatsNormalizedData,
	hasSiteStatsQueryFailed,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import PageViewTracker from '../stats-page-view-tracker';
import VideoDetailsCard from './video-details-card';
import VideoEmbedsCard from './video-embeds-card';
import VideoSummary from './video-summary';

import './style.scss';

interface StatsVideoDetailProps {
	postId: number;
	period: {
		period: string;
	};
	context: {
		query: Record< string, string >;
	};
}

interface VideoStatsPost {
	post_title?: string;
	post_date?: string;
}

export default function StatsVideoDetail( { postId, period, context }: StatsVideoDetailProps ) {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	// The video title and upload date come from the attachment post included in
	// the statsVideo response — available in both Calypso and Odyssey (the
	// stats-app proxy forwards stats routes). Mirrors VideoSummary's default
	// Days/Weeks query, which is always fetched first.
	const videoInfoQuery = useMemo(
		() => ( { postId, statType: 'views', period: 'month' } ),
		[ postId ]
	);
	const videoStatsData = useSelector(
		( state ) =>
			getSiteStatsNormalizedData( state, siteId, 'statsVideo', videoInfoQuery ) as {
				post?: VideoStatsPost | null;
			} | null
	);
	const hasVideoInfoFailed = useSelector( ( state ) =>
		siteId ? hasSiteStatsQueryFailed( state, siteId, 'statsVideo', videoInfoQuery ) : false
	);
	const videoStatsPost = videoStatsData?.post ?? null;
	const breadcrumbTrail = useStatsBreadcrumbTrail();
	const statType = context.query.statType ?? null;

	useEffect( () => {
		window.scrollTo( 0, 0 );
	}, [] );

	// Must run before useStatsBreadcrumbTrail's passive effect reads the
	// navigation history, so the trail treats this screen (not the previous
	// one) as the current entry to exclude.
	useLayoutEffect( () => {
		recordCurrentScreen( 'videodetails', {
			queryParams: context.query,
			period: period.period,
		} );
	}, [ context.query, period.period ] );

	const videoTitle = videoStatsPost?.post_title || null;
	const videoDate = videoStatsPost?.post_date || null;
	// Loading until statsVideo answers (success or failure); a response
	// without a post means there is genuinely no title and the card hides.
	const isVideoInfoLoading = ! videoStatsData && ! hasVideoInfoFailed;

	return (
		<Main
			fullWidthLayout
			breadcrumbs={ [
				...breadcrumbTrail.map( ( item ) => ( {
					label: item.label,
					to: item.url ?? undefined,
				} ) ),
				{ label: videoTitle || translate( 'Video details', { textOnly: true } ) },
			] }
		>
			<PageViewTracker
				path={ `/stats/${ period.period }/videodetails/:site` }
				title={ `Stats > ${ titlecase( period.period ) } > Videodetails` }
			/>
			<div className="stats stats-summary-view">
				<div
					id="my-stats-content"
					className="stats-summary-view stats-summary__positioned stats-video-detail"
				>
					<VideoDetailsCard
						title={ videoTitle }
						date={ videoDate }
						isLoading={ isVideoInfoLoading }
					/>
					<VideoSummary postId={ postId } initialStatType={ statType } />
					<VideoEmbedsCard postId={ postId } />
				</div>
			</div>
		</Main>
	);
}
