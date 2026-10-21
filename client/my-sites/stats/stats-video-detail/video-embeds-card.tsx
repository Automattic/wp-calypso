import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { useSelector } from 'calypso/state';
import {
	getSiteStatsNormalizedData,
	hasSiteStatsQueryFailed,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import StatsModulePlaceholder from '../stats-module/placeholder';

interface VideoEmbedsData {
	pages?: Array< { label: string; link: string } >;
}

export default function VideoEmbedsCard( { postId }: { postId: number } ) {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const query = useMemo( () => ( { postId } ), [ postId ] );

	const data = useSelector(
		( state ) =>
			getSiteStatsNormalizedData( state, siteId, 'statsVideo', query ) as VideoEmbedsData | null
	);
	const hasFailed = useSelector( ( state ) =>
		siteId ? hasSiteStatsQueryFailed( state, siteId, 'statsVideo', query ) : false
	);
	// QuerySiteStats defers its initial request, so the requesting flag can be
	// false on first render; treat missing data as loading to avoid flashing
	// the empty state. A failed request ends the loading state.
	const isLoading = ! data && ! hasFailed;

	const pages = data?.pages ?? [];

	return (
		<Card className="stats-video-embeds-card">
			{ siteId && <QuerySiteStats siteId={ siteId } statType="statsVideo" query={ query } /> }
			<h4 className="stats-video-embeds-card__heading">{ translate( 'Embedded pages' ) }</h4>
			<StatsModulePlaceholder isLoading={ isLoading } />
			{ ! isLoading && ! pages.length && (
				<div className="stats-video-embeds-card__empty">
					{ translate( 'No pages have embedded this video yet.' ) }
				</div>
			) }
			{ pages.length > 0 && (
				<ul className="stats-video-embeds-card__list">
					{ pages.map( ( page ) => (
						<li key={ page.link } className="stats-video-embeds-card__item">
							<a href={ page.link } target="_blank" rel="noopener noreferrer">
								{ page.label }
							</a>
						</li>
					) ) }
				</ul>
			) }
		</Card>
	);
}
