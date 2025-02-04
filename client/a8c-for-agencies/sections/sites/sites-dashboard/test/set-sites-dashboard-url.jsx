/**
 * @jest-environment jsdom
 */
import { mockedSites } from '../../../../data/sites.ts';
import { A4A_SITES_DASHBOARD_DEFAULT_CATEGORY } from '../../constants';
import { updateSitesDashboardUrl } from '../update-sites-dashboard-url';

describe( 'updateSitesDashboardUrl returns correct URL', () => {
	const category = 'overview';
	const setCategoryMock = jest.fn();

	const defaultSitesParams = {
		setCategory: setCategoryMock,
		selectedSiteFeature: 'jetpack-boost',
		currentPage: 1,
		sort: { field: 'url', direction: 'asc' },
	};

	const noAdditionalParams = {
		filters: null,
		search: null,
	};

	const filterSearchParams = {
		filters: [ { field: 'status', operator: 'in', value: 7 } ],
		search: 'elegant',
	};

	const defaultSelectedSiteNoAdditionalParams = {
		...noAdditionalParams,
		selectedSite: mockedSites[ 0 ],
	};
	const defaultSelectedSitePlusFilterSearch = {
		...filterSearchParams,
		selectedSite: mockedSites[ 0 ],
	};

	const defaultNoSelectedSitePlusFilterSearch = {
		...filterSearchParams,
		selectedSite: null,
	};

	const defaultNoSelectedSiteNoAdditionalParams = {
		...noAdditionalParams,
		selectedSite: null,
	};

	test( 'ensure we set the category when a URL is used with a selected site and no category', () => {
		updateSitesDashboardUrl( {
			category: null,
			showOnlyFavorites: false,
			...defaultSelectedSiteNoAdditionalParams,
			...defaultSitesParams,
		} );

		expect( setCategoryMock ).toHaveBeenCalledWith( A4A_SITES_DASHBOARD_DEFAULT_CATEGORY );
	} );

	test( 'returns correct URL when a site is selected', () => {
		const updatedUrl = updateSitesDashboardUrl( {
			category: category,
			showOnlyFavorites: false,
			...defaultSelectedSiteNoAdditionalParams,
			...defaultSitesParams,
		} );

		expect( setCategoryMock ).toHaveBeenCalledTimes( 1 );
		expect( updatedUrl ).toBe( '/sites/overview/elegantsuperbly.wpcomstaging.com' );
	} );

	test( 'returns correct URL when a site is selected with filters and search', () => {
		const updatedUrl = updateSitesDashboardUrl( {
			category: category,
			showOnlyFavorites: false,
			...defaultSelectedSitePlusFilterSearch,
			...defaultSitesParams,
		} );

		expect( updatedUrl ).toBe( '/sites/overview/elegantsuperbly.wpcomstaging.com' );
	} );

	test( 'returns correct URL with filters and search applied', () => {
		const updatedUrl = updateSitesDashboardUrl( {
			category: category,
			showOnlyFavorites: false,
			...defaultNoSelectedSitePlusFilterSearch,
			...defaultSitesParams,
		} );

		expect( updatedUrl ).toBe( '/sites?s=elegant&issue_types=plugin_updates' );
	} );

	test( 'returns correct URL for favorites', () => {
		const updatedUrl = updateSitesDashboardUrl( {
			category: category,
			showOnlyFavorites: true,
			...defaultNoSelectedSiteNoAdditionalParams,
			...defaultSitesParams,
		} );

		expect( updatedUrl ).toBe( '/sites?is_favorite' );
	} );

	test( 'returns correct URL for favorites, with filters and search added', () => {
		const updatedUrl = updateSitesDashboardUrl( {
			category: category,
			...defaultNoSelectedSitePlusFilterSearch,
			...defaultSitesParams,
			showOnlyFavorites: true,
		} );

		expect( updatedUrl ).toBe( '/sites?s=elegant&issue_types=plugin_updates&is_favorite' );
	} );

	test( 'returns correct URL for favorites plus filters when a site is selected', () => {
		const updatedUrl = updateSitesDashboardUrl( {
			category: category,
			showOnlyFavorites: true,
			...defaultSelectedSitePlusFilterSearch,
			...defaultSitesParams,
		} );

		expect( updatedUrl ).toBe( '/sites/overview/elegantsuperbly.wpcomstaging.com' );
	} );
} );
