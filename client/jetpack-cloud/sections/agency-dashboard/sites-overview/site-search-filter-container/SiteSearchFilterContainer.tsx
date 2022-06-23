import SiteFilters from '../site-filters';
import SiteSearch from '../site-search';
import type { AgencyDashboardFilter } from '../types';
import type { ReactElement } from 'react';

import './style.scss';

interface Props {
	searchQuery: string | null;
	currentPage: number;
	filter: AgencyDashboardFilter;
	isFetching: boolean;
}

export default function SiteSearchFilterContainer( {
	searchQuery,
	currentPage,
	filter,
	isFetching,
}: Props ): ReactElement {
	return (
		<div className="site-search-filter-container">
			<div className="site-search-filter-container__search">
				<SiteSearch searchQuery={ searchQuery } currentPage={ currentPage } />
			</div>
			<div className="site-search-filter-container__filter-bar">
				<SiteFilters filter={ filter } isFetching={ isFetching } />
			</div>
		</div>
	);
}
