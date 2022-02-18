import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import ActivityCardList from 'calypso/components/activity-card-list';
import useActivityLogQuery from 'calypso/data/activity-log/use-activity-log-query';
import getActivityLogFilter from 'calypso/state/selectors/get-activity-log-filter';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

export default function SearchResults() {
	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const filter = useSelector( ( state ) => getActivityLogFilter( state, siteId ) );

	const { data: rewindableEvents } = useActivityLogQuery( siteId, filter, {
		select: ( data ) => data.filter( ( a ) => a.activityIsRewindable ),
	} );

	return (
		<div className="backup__search">
			<div className="backup__search-header">{ translate( 'Find a backup or restore point' ) }</div>
			<div className="backup__search-description">
				{ translate(
					'This is the complete event history for your site. Filter by date range and/ or activity type.'
				) }
			</div>
			<ActivityCardList logs={ rewindableEvents } pageSize={ 10 } siteSlug={ siteSlug } />
		</div>
	);
}
