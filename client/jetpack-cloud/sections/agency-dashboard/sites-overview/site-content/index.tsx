import { Card } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useDispatch } from 'react-redux';
import Pagination from 'calypso/components/pagination';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import { addQueryArgs } from 'calypso/lib/route';
import { FilterbarWithoutDispatch as Filterbar } from 'calypso/my-sites/activity/filterbar';
import { updateFilter } from 'calypso/state/jetpack-agency-dashboard/actions';
import SiteCard from '../site-card';
import SiteTable from '../site-table';
import { formatSites } from '../utils';
import type {
	AgencyDashboardFilter,
	AgencyDashboardFilterOption,
} from 'calypso/state/jetpack-agency-dashboard/reducer';
import type { ReactElement } from 'react';
import './style.scss';

const addPageArgs = ( pageNumber: number ) => {
	const queryParams = { page: pageNumber };
	const currentPath = window.location.pathname + window.location.search;
	page( addQueryArgs( queryParams, currentPath ) );
};

interface Props {
	data: { sites: Array< any >; total: number; perPage: number } | undefined;
	isError: boolean;
	isFetching: boolean;
	currentPage: number;
	filter: AgencyDashboardFilter;
}

export default function SiteContent( {
	data,
	isError,
	isFetching,
	currentPage,
	filter,
}: Props ): ReactElement {
	const translate = useTranslate();
	const isMobile = useMobileBreakpoint();

	const sites = formatSites( data?.sites );

	const dispatch = useDispatch();
	const selectIssueTypes = ( types: AgencyDashboardFilterOption[] ) => {
		dispatch( updateFilter( types ) );
	};
	const resetIssueTypes = () => {
		dispatch( updateFilter( [] ) );
	};

	const columns = [
		{
			key: 'site',
			title: translate( 'Site' ),
		},
		{
			key: 'backup',
			title: translate( 'Backup' ),
		},
		{
			key: 'scan',
			title: translate( 'Scan' ),
		},
		{
			key: 'monitor',
			title: translate( 'Monitor' ),
		},
		{
			key: 'plugin',
			title: translate( 'Plugin Updates' ),
		},
	];

	if ( ! isFetching && ! isError && ! sites.length && ! filter.group.length ) {
		return <div className="site-content__no-sites">{ translate( 'No active sites' ) }</div>;
	}

	const handlePageClick = ( pageNumber: number ) => {
		addPageArgs( pageNumber );
	};

	return (
		<>
			<Filterbar
				selectorTypes={ { issueType: true } }
				filter={ filter }
				isLoading={ isFetching }
				isVisible={ true }
				selectActionType={ selectIssueTypes }
				resetFilters={ resetIssueTypes }
			/>
			<SiteTable isFetching={ isFetching } columns={ columns } items={ sites } />
			<div className="site-content__mobile-view">
				<>
					{ isFetching ? (
						<Card>
							<TextPlaceholder />
						</Card>
					) : (
						<>
							{ sites.length > 0 &&
								sites.map( ( rows, index ) => (
									<SiteCard key={ index } columns={ columns } rows={ rows } />
								) ) }
						</>
					) }
				</>
			</div>
			{ data && data?.total > 0 && (
				<Pagination
					compact={ isMobile }
					page={ currentPage }
					perPage={ data.perPage }
					total={ data.total }
					pageClick={ handlePageClick }
				/>
			) }
		</>
	);
}
