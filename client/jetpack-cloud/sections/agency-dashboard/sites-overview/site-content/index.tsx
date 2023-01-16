import { Card } from '@automattic/components';
import { useDesktopBreakpoint, useMobileBreakpoint } from '@automattic/viewport-react';
import page from 'page';
import { useContext } from 'react';
import Pagination from 'calypso/components/pagination';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import { addQueryArgs } from 'calypso/lib/route';
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
	const isDesktop = useDesktopBreakpoint();
	const { isBulkManagementActive } = useContext( SitesOverviewContext );

	const sites = formatSites( data?.sites );

	const handlePageClick = ( pageNumber: number ) => {
		addPageArgs( pageNumber );
	};

	return (
		<>
			{ isDesktop ? (
				<SiteTable isLoading={ isLoading } columns={ siteColumns } items={ sites } />
			) : (
				<>
					<div className="site-content__mobile-view">
						<>
							{ isBulkManagementActive && (
								<Card className="site-content__bulk-select">
									<SiteBulkSelect sites={ sites } isLoading={ isLoading } />
								</Card>
							) }
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
				</>
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
}
