import { Card } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import Pagination from 'calypso/components/pagination';
import TextPlaceholder from 'calypso/jetpack-cloud/sections/partner-portal/text-placeholder';
import { addQueryArgs } from 'calypso/lib/route';
import SiteCard from '../site-card';
import SiteTable from '../site-table';
import { formatSites, SITES_PER_PAGE } from '../utils';
import type { ReactElement } from 'react';

import './style.scss';

const addPageArgs = ( pageNumber: number ) => {
	const queryParams = { page: pageNumber };
	const currentPath = window.location.pathname + window.location.search;
	page( addQueryArgs( queryParams, currentPath ) );
};

interface Props {
	data: { sites: Array< any >; total: number } | undefined;
	isError: boolean;
	isFetching: boolean;
	currentPage: number;
	handlePageChange: ( pageNumber: number ) => void;
}

export default function SiteContent( {
	data,
	isError,
	isFetching,
	currentPage,
	handlePageChange,
}: Props ): ReactElement {
	const translate = useTranslate();
	const isMobile = useMobileBreakpoint();

	const sites = formatSites( data?.sites );

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

	if ( ! isFetching && ! isError && ! sites.length ) {
		return <div className="site-content__no-sites">{ translate( 'No active sites' ) }</div>;
	}

	const handlePageClick = ( pageNumber: number ) => {
		addPageArgs( pageNumber );
		handlePageChange( pageNumber );
	};

	return (
		<>
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
			{ data?.total && (
				<Pagination
					compact={ isMobile }
					page={ currentPage }
					perPage={ SITES_PER_PAGE }
					total={ data.total }
					pageClick={ handlePageClick }
				/>
			) }
		</>
	);
}
