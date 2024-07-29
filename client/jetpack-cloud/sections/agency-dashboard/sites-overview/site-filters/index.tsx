import { FilterbarWithoutDispatch as Filterbar } from 'calypso/my-sites/activity/filterbar';
import { useDispatch } from 'calypso/state';
import { updateFilter } from 'calypso/state/jetpack-agency-dashboard/actions';
import type { AgencyDashboardFilter, AgencyDashboardFilterOption } from '../types';

export default function SiteFilters( {
	filter,
	isLoading,
}: {
	filter: AgencyDashboardFilter;
	isLoading: boolean;
} ) {
	const dispatch = useDispatch();
	const selectIssueTypes = ( types: AgencyDashboardFilterOption[] ) => {
		dispatch( updateFilter( types ) );
	};
	const resetIssueTypes = () => {
		dispatch( updateFilter( [] ) );
	};

	return (
		<Filterbar
			selectorTypes={ { issueType: true } }
			filter={ filter }
			isLoading={ isLoading }
			isVisible
			selectActionType={ selectIssueTypes }
			resetFilters={ resetIssueTypes }
		/>
	);
}
