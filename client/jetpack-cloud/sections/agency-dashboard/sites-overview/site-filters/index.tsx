import { useDispatch } from 'react-redux';
import { FilterbarWithoutDispatch as Filterbar } from 'calypso/my-sites/activity/filterbar';
import { updateFilter } from 'calypso/state/jetpack-agency-dashboard/actions';
import type { AgencyDashboardFilter, AgencyDashboardFilterOption } from '../types';
import type { ReactElement } from 'react';

export default function SiteFilters( {
	filter,
	isLoading,
}: {
	filter: AgencyDashboardFilter;
	isLoading: boolean;
} ): ReactElement {
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
			isVisible={ true }
			selectActionType={ selectIssueTypes }
			resetFilters={ resetIssueTypes }
		/>
	);
}
