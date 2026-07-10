import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
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
import VideoDetailsCard, { VideoMediaItem } from './video-details-card';
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
	const breadcrumbTrail = useStatsBreadcrumbTrail();
	const statType = context.query.statType ?? null;

	useEffect( () => {
		window.scrollTo( 0, 0 );
	}, [] );

	useEffect( () => {
		recordCurrentScreen( 'videodetails', {
			queryParams: context.query,
			period: period.period,
		} );
	}, [ context.query, period.period ] );

	const title = media?.title || translate( 'Video', { textOnly: true } );

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
					<VideoDetailsCard media={ media } mediaId={ postId } />
					<VideoSummary postId={ postId } initialStatType={ statType } />
					<VideoEmbedsCard postId={ postId } />
				</div>
			</div>
		</Main>
	);
}
