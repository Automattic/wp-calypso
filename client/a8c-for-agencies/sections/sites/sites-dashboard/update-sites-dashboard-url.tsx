import page from '@automattic/calypso-router';
import { Filter } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/sites-dataviews/interfaces';
import {
	A4A_SITES_DASHBOARD_DEFAULT_CATEGORY,
	A4A_SITES_DASHBOARD_DEFAULT_FEATURE,
} from '../constants';
import { DashboardSortInterface, Site } from '../types';
import { getSelectedFilters } from './get-selected-filters';

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

	const queryParams = new URLSearchParams( window.location.search );

	if ( queryParams.has( 'sort_field' ) || sort.field !== 'url' ) {
		urlQuery.set( 'sort_field', sort.field );

		if ( queryParams.has( 'sort_direction' ) || sort.direction !== 'asc' ) {
			urlQuery.set(
				'sort_direction',
				queryParams.get( 'sort_direction' ) === 'asc' ? 'asc' : sort.direction
			);
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
	selectedSiteFeature,
	search,
	currentPage,
	sort,
	showOnlyFavorites,
}: {
	category?: string;
	setCategory: ( category: string ) => void;
	filters: Filter[];
	selectedSite?: Site;
	selectedSiteFeature?: string;
	search: string;
	currentPage: number;
	sort: DashboardSortInterface;
	showOnlyFavorites?: boolean;
} ) => {
	// We need a category in the URL if we have a selected site
	if ( selectedSite && ! category ) {
		setCategory( A4A_SITES_DASHBOARD_DEFAULT_CATEGORY );
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

	if (
		category &&
		selectedSite &&
		selectedSiteFeature &&
		selectedSiteFeature !== A4A_SITES_DASHBOARD_DEFAULT_FEATURE
	) {
		// If the selected feature is the default one, we can leave the url a little cleaner, that's why we are comparing to the default feature in the condition above.
		url = `${ baseUrl }/${ category }/${ selectedSite.url }/${ selectedSiteFeature }`;
		shouldAddQueryArgs = false;
	} else if ( category && selectedSite ) {
		url = `${ baseUrl }/${ category }/${ selectedSite.url }`;
		shouldAddQueryArgs = false;
	} else if ( category && category !== A4A_SITES_DASHBOARD_DEFAULT_CATEGORY ) {
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
