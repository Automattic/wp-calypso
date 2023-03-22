import { Card } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import page from 'page';
import { useContext, forwardRef, createRef } from 'react';
import Pagination from 'calypso/components/pagination';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import { addQueryArgs } from 'calypso/lib/route';
import EditButton from '../../dashboard-bulk-actions/edit-button';
import { useDashboardShowLargeScreen } from '../../hooks';
import SitesOverviewContext from '../context';
import SiteBulkSelect from '../site-bulk-select';
import SiteCard from '../site-card';
import SiteSort from '../site-sort';
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

const SiteContent = ( { data, isLoading, currentPage, isFavoritesTab }: Props, ref: any ) => {
	const isMobile = useMobileBreakpoint();

	const { isBulkManagementActive } = useContext( SitesOverviewContext );

	const sites = formatSites( data?.sites );

	const handlePageClick = ( pageNumber: number ) => {
		addPageArgs( pageNumber );
	};

	const siteTableRef = createRef< HTMLTableElement >();

	const isLargeScreen = useDashboardShowLargeScreen( siteTableRef, ref );

	const firstColumn = siteColumns[ 0 ];

	return (
		<>
			{ isLargeScreen ? (
				<div className="site-content__large-screen-view">
					<SiteTable
						ref={ siteTableRef }
						isLoading={ isLoading }
						columns={ siteColumns }
						items={ sites }
					/>
				</div>
			) : (
				<div className="site-content__small-screen-view">
					<Card className="site-content__bulk-select">
						{ isBulkManagementActive ? (
							<SiteBulkSelect sites={ sites } isLoading={ isLoading } />
						) : (
							<>
								<span className="site-content__bulk-select-label">{ firstColumn.title }</span>
								{ firstColumn.isSortable && <SiteSort columnKey={ firstColumn.key } /> }
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
			) }

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
};

export default forwardRef( SiteContent );
