import { DataViewsFilter } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import { Filter } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/sites-dataviews/interfaces';
import {
	A4A_SITES_DASHBOARD_DEFAULT_CATEGORY,
	A4A_SITES_DASHBOARD_DEFAULT_FEATURE,
	DEFAULT_SORT_DIRECTION,
	DEFAULT_SORT_FIELD,
} from '../constants';
import { DashboardSortInterface, Site } from '../types';
import { getSelectedFilters } from './get-selected-filters';

const buildQueryString = ( {
	filters,
	search,
	currentPage,
	sort,
	showOnlyFavorites,
	showOnlyDevelopmentSites,
}: {
	filters: Filter[];
	search: string;
	currentPage: number;
	sort?: DashboardSortInterface;
	showOnlyFavorites?: boolean;
	showOnlyDevelopmentSites?: boolean;
} ) => {
	const urlQuery = new URLSearchParams();

	if ( search ) {
		urlQuery.set( 's', search );
	}

	if ( currentPage > 1 ) {
		urlQuery.set( 'page', currentPage.toString() );
	}

	// ASC is the default sort direction for the URL
	if (
		( sort && sort.field !== DEFAULT_SORT_FIELD ) ||
		( sort && sort.field === DEFAULT_SORT_FIELD && sort.direction !== DEFAULT_SORT_DIRECTION )
	) {
		urlQuery.set( 'sort_field', sort.field );
		urlQuery.set( 'sort_direction', sort.direction );
	}

	if ( filters && filters.length > 0 ) {
		const selectedFilters = getSelectedFilters( filters );
		urlQuery.set( 'issue_types', selectedFilters.join( ',' ) );
	}

	if ( showOnlyFavorites ) {
		urlQuery.set( 'is_favorite', '' );
	}

	if ( showOnlyDevelopmentSites ) {
		urlQuery.set( 'is_development', '' );
	}

	const queryString = urlQuery
		.toString()
		.replace( 'is_favorite=', 'is_favorite' )
		.replace( 'is_development=', 'is_development' );

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
	showOnlyDevelopmentSites,
}: {
	category?: string;
	setCategory: ( category: string ) => void;
	filters: DataViewsFilter[];
	selectedSite?: Site;
	selectedSiteFeature?: string;
	search: string;
	currentPage: number;
	sort?: DashboardSortInterface;
	showOnlyFavorites?: boolean;
	showOnlyDevelopmentSites?: boolean;
} ) => {
	// We need a category in the URL if we have a selected site
	if ( selectedSite && ! category ) {
		setCategory( A4A_SITES_DASHBOARD_DEFAULT_CATEGORY );
		return;
	}

	const baseUrl = '/sites';
	let url = baseUrl;
	let shouldAddQueryArgs = true;

	const queryString = buildQueryString( {
		filters,
		search,
		currentPage,
		sort,
		showOnlyFavorites,
		showOnlyDevelopmentSites,
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
	return url;
};
