import { useSelector } from 'react-redux';
import { useQueryRewindCapabilities } from 'calypso/components/data/query-rewind-capabilities';
import { useQueryRewindPolicies } from 'calypso/components/data/query-rewind-policies';
import { useQueryRewindState } from 'calypso/components/data/query-rewind-state';
import { getRewindPoliciesRequestStatus } from 'calypso/state/rewind/selectors';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import FilterBarContainer from './filterbar-container';
import ListContent from './list-content';
import Loading from './loading';

import './style.scss';

// TODO: May want to standardize on a pre-existing Activity type,
// 		 like the one in `components/activity-card/types.ts`.
type ActivityLogEntry = unknown;

type OwnProps = {
	showDateSeparators?: boolean;
	showFilter?: boolean;
	showPagination?: boolean;
	pageSize?: number;
	logs: ActivityLogEntry[];
};

const ActivityCardList: React.FC< OwnProps > = ( {
	showDateSeparators = true,
	showFilter = true,
	showPagination = true,
	logs,
	pageSize = 10,
} ) => {
	const siteId = useSelector( getSelectedSiteId ) as number;
	useQueryRewindPolicies( siteId );
	useQueryRewindCapabilities( siteId );
	useQueryRewindState( siteId );

	const policiesRequestStatus = useSelector( ( state ) =>
		getRewindPoliciesRequestStatus( state, siteId )
	);
	const isLoading = policiesRequestStatus === 'pending';
	const requestError = policiesRequestStatus === 'failure';
	const noData = ! logs;

	if ( isLoading || requestError || noData ) {
		return <Loading showDateSeparators={ showDateSeparators } showPagination={ showPagination } />;
	}

	return (
		<div className="activity-card-list">
			{ showFilter && <FilterBarContainer /> }
			<ListContent
				showDateSeparators={ showDateSeparators }
				showPagination={ showPagination }
				logs={ logs }
				pageSize={ pageSize }
			/>
		</div>
	);
};

export default ActivityCardList;
