import page from '@automattic/calypso-router';
import { Filter } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/sites-dataviews/interfaces';
import { DashboardSortInterface } from 'calypso/sites-dashboard/sections/sites/sites-overview/types';
import { SITES_DASHBOARD_DEFAULT_CATEGORY } from '../constants';
import { getSelectedFilters } from './get-selected-filters';
import type { SiteExcerptData } from '@automattic/sites';

const buildQueryString = ( {
	filters,
	search,
	currentPage,
	sort,
	showOnlyFavorites,
}: {
	filters: Filter[];
	search: string;
	currentPage: number;
	sort: DashboardSortInterface;
	showOnlyFavorites?: boolean;
} ) => {
	const urlQuery = new URLSearchParams();

	if ( search ) {
		urlQuery.set( 's', search );
	}

	if ( currentPage > 1 ) {
		urlQuery.set( 'page', currentPage.toString() );
	}

	if ( sort.field && sort.field !== 'url' ) {
		urlQuery.set( 'sort_field', sort.field );

		if ( sort.direction && sort.direction !== 'asc' ) {
			urlQuery.set( 'sort_direction', sort.direction );
		}
	}

	if ( filters && filters.length > 0 ) {
		const selectedFilters = getSelectedFilters( filters );
		urlQuery.set( 'issue_types', selectedFilters.join( ',' ) );
	}

	let queryString = urlQuery.toString();
	if ( showOnlyFavorites ) {
		queryString = queryString ? `is_favorite&${ queryString }` : 'is_favorite';
	}
	return queryString ? `?${ queryString }` : '';
};

export const updateSitesDashboardUrl = ( {
	category,
	setCategory,
	filters,
	selectedSite,
	search,
	currentPage,
	sort,
	showOnlyFavorites,
}: {
	category?: string;
	setCategory: ( category: string ) => void;
	filters: Filter[];
	selectedSite?: SiteExcerptData;
	search: string;
	currentPage: number;
	sort: DashboardSortInterface;
	showOnlyFavorites?: boolean;
} ) => {
	// We need a category in the URL if we have a selected site
	if ( selectedSite && ! category ) {
		setCategory( SITES_DASHBOARD_DEFAULT_CATEGORY );
		return;
	}

	const baseUrl = '/sites';
	let url = baseUrl;
	let shouldAddQueryArgs = true;
	// We are not using { addQueryArgs } from 'calypso/lib/url'; because it doesn't support empty keys (e.g. /sites?is_favorite)
	const queryString = buildQueryString( {
		filters,
		search,
		currentPage,
		sort,
		showOnlyFavorites,
	} );

	if ( category && selectedSite ) {
		url = `${ baseUrl }/${ category }/${ selectedSite.URL }`;
		shouldAddQueryArgs = false;
	} else if ( category && category !== SITES_DASHBOARD_DEFAULT_CATEGORY ) {
		// If the selected category is the default one, we can leave the url a little cleaner, that's why we are comparing to the default category in the condition above.
		url = `${ baseUrl }/${ category }`;
	}

	if ( shouldAddQueryArgs ) {
		url += queryString;
	}

	if ( page.current !== url ) {
		page.replace( url );
	}
};
