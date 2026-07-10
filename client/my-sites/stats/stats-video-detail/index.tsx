import { useTranslate } from 'i18n-calypso';
import { useEffect, useLayoutEffect } from 'react';
import titlecase from 'to-title-case';
import QueryMedia from 'calypso/components/data/query-media';
import Main from 'calypso/my-sites/stats/components/stats-main';
import {
	useStatsBreadcrumbTrail,
	recordCurrentScreen,
} from 'calypso/my-sites/stats/hooks/use-stats-navigation-history';
import { useSelector } from 'calypso/state';
import getMediaItem from 'calypso/state/selectors/get-media-item';
import { getSiteStatsNormalizedData } from 'calypso/state/stats/lists/selectors';
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

interface VideoMediaItem {
	title?: string;
	date?: string;
	/** Video duration in seconds. */
	length?: number;
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
	const videoStatsData = useSelector(
		( state ) =>
			getSiteStatsNormalizedData( state, siteId, 'statsVideo', {
				postId,
				statType: 'views',
				period: 'month',
			} ) as { post?: VideoStatsPost | null } | null
	);
	const videoStatsPost = videoStatsData?.post ?? null;
	// The media item is only needed for the video duration (retention rate);
	// the request 404s harmlessly in Odyssey, where the stats-app proxy has no
	// media route, and the retention card is simply omitted.
	const media = useSelector(
		( state ) => getMediaItem( state, siteId, postId ) as VideoMediaItem | null
	);
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

	const videoTitle = videoStatsPost?.post_title || media?.title || null;
	const videoDate = videoStatsPost?.post_date || media?.date || null;
	// Loading = neither source has responded yet; once statsVideo answers, a
	// missing post means there is genuinely no title and the card hides.
	const isVideoInfoLoading = ! videoStatsData && ! media;

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
			{ siteId && <QueryMedia siteId={ siteId } mediaId={ postId } /> }
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
