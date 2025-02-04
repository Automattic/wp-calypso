/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import { SitesSortKey, SitesSortOrder, useSitesListSorting } from '../src';

describe( 'useSitesSorting', () => {
	const filteredSites = [
		{
			ID: 1,
			title: 'B',
			options: {
				updated_at: '2022-05-27T07:19:20+00:00',
			},
			user_interactions: [ '2022-09-13' ],
		},
		{
			ID: 2,
			title: 'A',
			options: {
				updated_at: '2022-07-13T17:17:12+00:00',
			},
			user_interactions: [ '2022-09-14' ],
		},
		{
			ID: 3,
			title: 'C',
			options: {
				updated_at: '2022-06-14T13:32:34+00:00',
			},
		},
	];
	const frequentSites = [
		{
			ID: 1,
			title: 'B',
			options: {
				updated_at: '2022-05-27T07:19:20+00:00',
			},
			user_interactions: [ '2022-09-20' ],
		},
		{
			ID: 2,
			title: 'A',
			options: {
				updated_at: '2022-07-13T17:17:12+00:00',
			},
			user_interactions: [ '2022-09-19' ],
		},
		{
			ID: 3,
			title: 'C',
			options: {
				updated_at: '2022-06-14T13:32:34+00:00',
			},
			user_interactions: [ '2022-09-19', '2022-09-16', '2022-09-13', '2022-09-09' ],
		},
	];

	const frequentSitesWithStaging = [
		{
			ID: 1,
			title: 'B',
			options: {
				updated_at: '2022-05-27T07:19:20+00:00',
			},
			user_interactions: [ '2022-09-25' ],
		},
		{
			ID: 2,
			title: 'A',
			options: {
				updated_at: '2022-07-13T17:17:12+00:00',
				wpcom_staging_blog_ids: [ 3 ],
			},
			user_interactions: [ '2022-09-19' ],
		},
		{
			ID: 3,
			title: 'C',
			is_wpcom_staging_site: true,
			options: {
				updated_at: '2022-06-14T13:32:34+00:00',
				wpcom_production_blog_id: 2,
			},
			user_interactions: [ '2022-09-21', '2022-09-16', '2022-09-13', '2022-09-09' ],
		},
		{
			ID: 4,
			title: 'E',
			options: {
				updated_at: '2022-06-14T13:32:34+00:00',
			},
			user_interactions: [ '2022-09-16', '2022-09-13', '2022-09-09' ],
		},
	];

	const frequentSitesWithStagingMissingProduction = [
		{
			ID: 1,
			title: 'B',
			options: {
				updated_at: '2022-05-27T07:19:20+00:00',
			},
			user_interactions: [ '2022-09-25' ],
		},
		{
			ID: 2,
			title: 'A',
			options: {
				updated_at: '2022-07-13T17:17:12+00:00',
				wpcom_staging_blog_ids: [ 3 ],
			},
			user_interactions: [ '2022-09-19' ],
		},
		{
			ID: 3,
			title: 'C',
			is_wpcom_staging_site: true,
			options: {
				updated_at: '2022-06-14T13:32:34+00:00',
				wpcom_production_blog_id: 2,
			},
			user_interactions: [ '2022-09-21', '2022-09-16', '2022-09-13', '2022-09-09' ],
		},
		{
			ID: 4,
			title: 'E',
			options: {
				updated_at: '2022-06-14T13:32:34+00:00',
			},
			user_interactions: [ '2022-09-16', '2022-09-13', '2022-09-09' ],
		},
		{
			ID: 5,
			title: 'F',
			is_wpcom_staging_site: true,
			options: {
				wpcom_production_blog_id: 10,
				updated_at: '2022-06-14T13:32:34+00:00',
			},
			user_interactions: [ '2022-09-16', '2022-09-13', '2022-09-09' ],
		},
	];

	const frequentSitesWithStagingMissing = [
		{
			ID: 1,
			title: 'B',
			options: {
				updated_at: '2022-05-27T07:19:20+00:00',
			},
			user_interactions: [ '2022-09-25' ],
		},
		{
			ID: 2,
			title: 'A',
			options: {
				updated_at: '2022-07-13T17:17:12+00:00',
				wpcom_staging_blog_ids: [ 3, 11, 5 ],
			},
			user_interactions: [ '2022-09-19' ],
		},
		{
			ID: 3,
			title: 'C',
			is_wpcom_staging_site: true,
			options: {
				updated_at: '2022-06-14T13:32:34+00:00',
				wpcom_production_blog_id: 2,
			},
			user_interactions: [ '2022-09-21', '2022-09-16', '2022-09-13', '2022-09-09' ],
		},
		{
			ID: 4,
			title: 'E',
			options: {
				updated_at: '2022-06-14T13:32:34+00:00',
			},
			user_interactions: [ '2022-09-16', '2022-09-13', '2022-09-09' ],
		},
		{
			ID: 5,
			title: 'F',
			is_wpcom_staging_site: true,
			options: {
				updated_at: '2022-06-14T13:32:34+00:00',
				wpcom_production_blog_id: 2,
			},
			user_interactions: [ '2022-09-16', '2022-09-13', '2022-09-09' ],
		},
	];
	const sitesWithEmptyTitle = [
		{
			ID: 1,
			options: {
				updated_at: '2022-05-27T07:19:20+00:00',
			},
			user_interactions: [ '2022-09-13' ],
		},
		{
			ID: 2,
			options: {
				updated_at: '2022-07-13T17:17:12+00:00',
			},
			user_interactions: [ '2022-09-14' ],
		},
		{
			ID: 3,
			options: {
				updated_at: '2022-06-14T13:32:34+00:00',
			},
		},
	];

	const sitesWithEmptyStagingSites = [
		{
			ID: 1,
			title: 'A',
			options: {
				updated_at: '2022-06-14T13:32:34+00:00',
				wpcom_staging_blog_ids: '',
			},
			user_interactions: [ '2022-09-16', '2022-09-13', '2022-09-09' ],
		},
		{
			ID: 4,
			title: 'E',
			options: {
				updated_at: '2022-06-15T13:32:34+00:00',
				wpcom_staging_blog_ids: '',
			},
			user_interactions: [ '2022-09-16', '2022-09-13', '2022-09-09' ],
		},
	];

	test( 'should not sort sites if unsupported sortKey is provided', () => {
		const { result } = renderHook( () =>
			useSitesListSorting( filteredSites, {
				sortKey: 'sort-that-is-not-supported' as SitesSortKey,
				sortOrder: 'asc',
			} )
		);

		expect( result.current.length ).toBe( 3 );
		expect( result.current[ 0 ].ID ).toBe( 1 );
		expect( result.current[ 1 ].ID ).toBe( 2 );
		expect( result.current[ 2 ].ID ).toBe( 3 );
	} );

	test( 'should sort sites alphabetically ascending', () => {
		const { result } = renderHook( () =>
			useSitesListSorting( filteredSites, {
				sortKey: 'alphabetically',
				sortOrder: 'asc',
			} )
		);

		expect( result.current.length ).toBe( 3 );
		expect( result.current[ 0 ].title ).toBe( 'A' );
		expect( result.current[ 1 ].title ).toBe( 'B' );
		expect( result.current[ 2 ].title ).toBe( 'C' );
	} );

	test( 'should sort sites alphabetically descending', () => {
		const { result } = renderHook( () =>
			useSitesListSorting( filteredSites, {
				sortKey: 'alphabetically',
				sortOrder: 'desc',
			} )
		);

		expect( result.current.length ).toBe( 3 );
		expect( result.current[ 0 ].title ).toBe( 'C' );
		expect( result.current[ 1 ].title ).toBe( 'B' );
		expect( result.current[ 2 ].title ).toBe( 'A' );
	} );

	test( 'should not break when sort sites without title', () => {
		const { result } = renderHook( () =>
			useSitesListSorting( sitesWithEmptyTitle, {
				sortKey: 'alphabetically',
				sortOrder: 'asc',
			} )
		);

		expect( result.current.length ).toBe( 3 );
		expect( result.current[ 0 ].ID ).toBe( 1 );
		expect( result.current[ 1 ].ID ).toBe( 2 );
		expect( result.current[ 2 ].ID ).toBe( 3 );
	} );

	test( 'should sort sites by last interaction descending', () => {
		const { result } = renderHook( () =>
			useSitesListSorting( filteredSites, {
				sortKey: 'lastInteractedWith',
				sortOrder: 'desc',
			} )
		);

		expect( result.current.length ).toBe( 3 );
		expect( result.current[ 0 ].title ).toBe( 'A' );
		expect( result.current[ 1 ].title ).toBe( 'B' );
		expect( result.current[ 2 ].title ).toBe( 'C' );
	} );

	test( 'should sort sites by last interaction ascending', () => {
		const { result } = renderHook( () =>
			useSitesListSorting( filteredSites, {
				sortKey: 'lastInteractedWith',
				sortOrder: 'asc',
			} )
		);

		expect( result.current.length ).toBe( 3 );
		expect( result.current[ 0 ].title ).toBe( 'C' );
		expect( result.current[ 1 ].title ).toBe( 'B' );
		expect( result.current[ 2 ].title ).toBe( 'A' );
	} );

	test( 'should pick the site more frequently interacted with ascending', () => {
		const { result } = renderHook( () =>
			useSitesListSorting( frequentSites, {
				sortKey: 'lastInteractedWith',
				sortOrder: 'asc',
			} )
		);
		expect( result.current.length ).toBe( 3 );
		expect( result.current[ 0 ].title ).toBe( 'A' );
		expect( result.current[ 1 ].title ).toBe( 'B' );
		expect( result.current[ 2 ].title ).toBe( 'C' );
	} );

	test( 'should keep the staging sites under their production sites, retaining the order for other sites', () => {
		const { result } = renderHook( () =>
			useSitesListSorting( frequentSitesWithStaging, {
				sortKey: 'lastInteractedWith',
				sortOrder: 'asc',
			} )
		);
		// After sortSitesByLastInteractedWith: A -> B -> E -> C
		expect( result.current.length ).toBe( 4 );
		expect( result.current[ 0 ].title ).toBe( 'A' );
		expect( result.current[ 1 ].title ).toBe( 'C' );
		expect( result.current[ 2 ].title ).toBe( 'B' );
		expect( result.current[ 3 ].title ).toBe( 'E' );
	} );

	test( 'should not change the order of a staging site if its associated producion site is filtered out', () => {
		const { result } = renderHook( () =>
			useSitesListSorting( frequentSitesWithStagingMissingProduction, {
				sortKey: 'lastInteractedWith',
				sortOrder: 'asc',
			} )
		);
		// After sortSitesByLastInteractedWith: A -> B -> F -> E -> C
		expect( result.current.length ).toBe( 5 );
		expect( result.current[ 0 ].title ).toBe( 'A' );
		expect( result.current[ 1 ].title ).toBe( 'C' );
		expect( result.current[ 2 ].title ).toBe( 'B' );
		expect( result.current[ 3 ].title ).toBe( 'F' );
		expect( result.current[ 4 ].title ).toBe( 'E' );
	} );

	test( 'should staging sites that missing, down to the production site list', () => {
		const { result } = renderHook( () =>
			useSitesListSorting( frequentSitesWithStagingMissing, {
				sortKey: 'lastInteractedWith',
				sortOrder: 'asc',
			} )
		);
		// After sortSitesByLastInteractedWith: A -> B -> F -> E -> C
		expect( result.current.length ).toBe( 5 );
		expect( result.current[ 0 ].title ).toBe( 'A' );
		expect( result.current[ 1 ].title ).toBe( 'F' );
		expect( result.current[ 2 ].title ).toBe( 'C' );
		expect( result.current[ 3 ].title ).toBe( 'B' );
		expect( result.current[ 4 ].title ).toBe( 'E' );
	} );

	test( 'should pick the site more frequently interacted with descending', () => {
		const { result } = renderHook( () =>
			useSitesListSorting( frequentSites, {
				sortKey: 'lastInteractedWith',
				sortOrder: 'desc',
			} )
		);
		expect( result.current.length ).toBe( 3 );
		expect( result.current[ 0 ].title ).toBe( 'C' );
		expect( result.current[ 1 ].title ).toBe( 'B' );
		expect( result.current[ 2 ].title ).toBe( 'A' );
	} );

	test( 'should sort sites by updatedAt descending', () => {
		const { result } = renderHook( () =>
			useSitesListSorting( filteredSites, {
				sortKey: 'updatedAt',
				sortOrder: 'desc',
			} )
		);

		expect( result.current.length ).toBe( 3 );
		expect( result.current[ 0 ].ID ).toBe( 2 );
		expect( result.current[ 1 ].ID ).toBe( 3 );
		expect( result.current[ 2 ].ID ).toBe( 1 );
	} );

	test( 'should sort sites by updatedAt ascending', () => {
		const { result } = renderHook( () =>
			useSitesListSorting( filteredSites, {
				sortKey: 'updatedAt',
				sortOrder: 'asc',
			} )
		);

		expect( result.current.length ).toBe( 3 );
		expect( result.current[ 0 ].ID ).toBe( 1 );
		expect( result.current[ 1 ].ID ).toBe( 3 );
		expect( result.current[ 2 ].ID ).toBe( 2 );
	} );

	test( 'sorting maintains object equality', () => {
		// Object equality is important for memoizing the site row

		const { result, rerender } = renderHook(
			( { sortKey, sortOrder } ) => useSitesListSorting( filteredSites, { sortKey, sortOrder } ),
			{
				initialProps: {
					sortKey: 'updatedAt' as SitesSortKey,
					sortOrder: 'asc' as SitesSortOrder,
				},
			}
		);

		expect( result.current ).toHaveLength( 3 );
		expect( result.current[ 0 ] ).toBe( filteredSites[ 0 ] );
		expect( result.current[ 1 ] ).toBe( filteredSites[ 2 ] );
		expect( result.current[ 2 ] ).toBe( filteredSites[ 1 ] );

		rerender( { sortKey: 'updatedAt', sortOrder: 'desc' } );

		// A (1) -> C (2) -> B (0)
		expect( result.current ).toHaveLength( 3 );
		expect( result.current[ 0 ] ).toBe( filteredSites[ 1 ] );
		expect( result.current[ 1 ] ).toBe( filteredSites[ 2 ] );
		expect( result.current[ 2 ] ).toBe( filteredSites[ 0 ] );

		// A (1) -> B (0) -> C (2)
		rerender( { sortKey: 'alphabetically', sortOrder: 'asc' } );
		expect( result.current ).toHaveLength( 3 );
		expect( result.current[ 0 ] ).toBe( filteredSites[ 1 ] );
		expect( result.current[ 1 ] ).toBe( filteredSites[ 0 ] );
		expect( result.current[ 2 ] ).toBe( filteredSites[ 2 ] );

		// A (1) -> B (0) -> C (2)
		rerender( { sortKey: 'lastInteractedWith', sortOrder: 'desc' } );
		expect( result.current ).toHaveLength( 3 );
		expect( result.current[ 0 ] ).toBe( filteredSites[ 1 ] );
		expect( result.current[ 1 ] ).toBe( filteredSites[ 0 ] );
		expect( result.current[ 2 ] ).toBe( filteredSites[ 2 ] );
	} );

	test( 'should not break when wpcom_staging_blog_ids is empty', () => {
		const { result } = renderHook( () =>
			useSitesListSorting( sitesWithEmptyStagingSites, {
				sortKey: 'lastInteractedWith',
				sortOrder: 'asc',
			} )
		);

		expect( result.current.length ).toBe( 2 );
	} );
} );
