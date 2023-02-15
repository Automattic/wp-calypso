import { Card } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import page from 'page';
import { useContext } from 'react';
import Pagination from 'calypso/components/pagination';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import { addQueryArgs } from 'calypso/lib/route';
import EditButton from '../../dashboard-bulk-actions/edit-button';
import SitesOverviewContext from '../context';
import SiteBulkSelect from '../site-bulk-select';
import SiteCard from '../site-card';
import SiteTable from '../site-table';
import { formatSites, siteColumns } from '../utils';

import './style.scss';

const addPageArgs = ( pageNumber: number ) => {
	const queryParams = { page: pageNumber };
	const currentPath = window.location.pathname + window.location.search;
	page( addQueryArgs( queryParams, currentPath ) );
};

interface Props {
	data: { sites: Array< any >; total: number; perPage: number; totalFavorites: number } | undefined;
	isLoading: boolean;
	currentPage: number;
	isFavoritesTab: boolean;
}

export default function SiteContent( { data, isLoading, currentPage, isFavoritesTab }: Props ) {
	const isMobile = useMobileBreakpoint();
	const { isBulkManagementActive } = useContext( SitesOverviewContext );

	const sites = formatSites( data?.sites );

	const handlePageClick = ( pageNumber: number ) => {
		addPageArgs( pageNumber );
	};

	return (
		<>
			{
				// We are using CSS to hide/show add email content on mobile/large screen view instead of the breakpoint
				// hook since the hook returns true only when the width > some value, and we have some
				// styles applied using the CSS breakpoint which is true for width >= some value
			 }
			<div className="site-content__large-screen-view">
				<SiteTable isLoading={ isLoading } columns={ siteColumns } items={ sites } />
			</div>
			<div className="site-content__small-screen-view">
				<Card className="site-content__bulk-select">
					{ isBulkManagementActive ? (
						<SiteBulkSelect sites={ sites } isLoading={ isLoading } />
					) : (
						<>
							<span className="site-content__bulk-select-label">{ siteColumns[ 0 ].title }</span>
							<EditButton sites={ sites } />
						</>
					) }
				</Card>
				<div className="site-content__mobile-view">
					<>
						{ isLoading ? (
							<Card>
								<TextPlaceholder />
							</Card>
						) : (
							<>
								{ sites.length > 0 &&
									sites.map( ( rows, index ) => (
										<SiteCard key={ index } columns={ siteColumns } rows={ rows } />
									) ) }
							</>
						) }
					</>
				</div>
			</div>

			{ data && data?.total > 0 && (
				<Pagination
					compact={ isMobile }
					page={ currentPage }
					perPage={ data.perPage }
					total={ isFavoritesTab ? data.totalFavorites : data.total }
					pageClick={ handlePageClick }
				/>
			) }
		</>
	);
}
