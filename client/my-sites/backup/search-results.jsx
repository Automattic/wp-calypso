import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import ActivityCardList from 'calypso/components/activity-card-list';
import getActivityLogFilter from 'calypso/state/selectors/get-activity-log-filter';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import { useActivityLogs } from './hooks';

const SearchResults = () => {
	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );

	const filter = useSelector( ( state ) => getActivityLogFilter( state, siteId ) );
	const { activityLogs } = useActivityLogs( siteId, filter );
	const rewindableEvents = activityLogs && activityLogs.filter( ( a ) => a.activityIsRewindable );

	return (
		<div className="backup__search">
			<div className="backup__search-header">{ translate( 'Find a backup or restore point' ) }</div>
			<div className="backup__search-description">
				{ translate(
					'This is the complete event history for your site. Filter by date range and/ or activity type.'
				) }
			</div>
			<ActivityCardList logs={ rewindableEvents } />
		</div>
	);
};

export default SearchResults;
