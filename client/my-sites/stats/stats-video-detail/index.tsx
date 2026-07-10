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
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import PageViewTracker from '../stats-page-view-tracker';
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

export default function StatsVideoDetail( { postId, period, context }: StatsVideoDetailProps ) {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	// The media item is a best-effort enhancement for the breadcrumb title:
	// the request 404s in Odyssey Stats (the stats-app proxy has no media
	// route), in which case the static label below is used instead.
	const media = useSelector(
		( state ) => getMediaItem( state, siteId, postId ) as { title?: string } | null
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

	const title = media?.title || translate( 'Video details', { textOnly: true } );

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
			{ siteId && <QueryMedia siteId={ siteId } mediaId={ postId } /> }
			<div className="stats stats-summary-view">
				<div
					id="my-stats-content"
					className="stats-summary-view stats-summary__positioned stats-video-detail"
				>
					<VideoSummary postId={ postId } initialStatType={ statType } />
					<VideoEmbedsCard postId={ postId } />
				</div>
			</div>
		</Main>
	);
}
