import config from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useLayoutEffect, useMemo } from 'react';
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
import VideoDetailsCard, { VideoMediaItem, VideoStatsPost } from './video-details-card';
import VideoEmbedsCard from './video-embeds-card';
import VideoSummary from './video-summary';

interface StatsVideoDetailProps {
	postId: number;
	period: {
		period: string;
	};
	context: {
		query: Record< string, string >;
	};
}

export default function StatsVideoDetail( { postId, period, context }: StatsVideoDetailProps ) {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const media = useSelector(
		( state ) => getMediaItem( state, siteId, postId ) as VideoMediaItem | null
	);
	// The stats-app proxy has no media route yet, so the media item is not
	// fetched in Odyssey; the title/date fall back to the attachment post from
	// the stats/video response (fetched by VideoEmbedsCard with the same query)
	// and the thumbnail is omitted.
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const videoQuery = useMemo( () => ( { postId } ), [ postId ] );
	const statsPost = useSelector( ( state ) => {
		const data = getSiteStatsNormalizedData( state, siteId, 'statsVideo', videoQuery ) as {
			post?: VideoStatsPost | null;
		} | null;
		return data?.post ?? null;
	} );
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

	const title = media?.title || statsPost?.title || translate( 'Video', { textOnly: true } );

	return (
		<Main
			fullWidthLayout
			breadcrumbs={ [
				...breadcrumbTrail.map( ( item ) => ( {
					label: item.label,
					to: item.url ?? undefined,
				} ) ),
				{ label: title },
			] }
		>
			<PageViewTracker
				path={ `/stats/${ period.period }/videodetails/:site` }
				title={ `Stats > ${ titlecase( period.period ) } > Videodetails` }
			/>
			{ siteId && ! isOdysseyStats && <QueryMedia siteId={ siteId } mediaId={ postId } /> }
			<div className="stats stats-summary-view">
				<div
					id="my-stats-content"
					className="stats-summary-view stats-summary__positioned stats-video-detail"
				>
					<VideoDetailsCard media={ media } statsPost={ statsPost } mediaId={ postId } />
					<VideoSummary
						postId={ postId }
						initialStatType={ statType }
						videoDuration={ media?.length ?? null }
					/>
					<VideoEmbedsCard postId={ postId } />
				</div>
			</div>
		</Main>
	);
}
