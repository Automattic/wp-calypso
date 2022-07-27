/**
 * @jest-environment jsdom
 */

import { useSitesTableSorting } from '../use-sites-table-sorting';

describe( 'useSitesTableSorting', () => {
	const filteredSites = [
		{
			ID: 1,
			options: {
				updated_at: '2022-05-27T07:19:20+00:00',
			},
		},
		{
			ID: 2,
			options: {
				updated_at: '2022-07-13T17:17:12+00:00',
			},
		},
		{
			ID: 3,
			options: {
				updated_at: '2022-06-14T13:32:34+00:00',
			},
		},
	];

	test( 'should do not sort sites if unsupported sort is provided', () => {
		const { sortedSites } = useSitesTableSorting( filteredSites, {
			sort: 'sort-that-is-not-supported',
			order: 'asc',
		} );

		expect( sortedSites.length ).toBe( 3 );
		expect( sortedSites[ 0 ].ID ).toBe( 1 );
		expect( sortedSites[ 1 ].ID ).toBe( 2 );
		expect( sortedSites[ 2 ].ID ).toBe( 3 );
	} );

	test( 'should sort sites by updated-at descending', () => {
		const { sortedSites } = useSitesTableSorting( filteredSites, {
			sort: 'updated-at',
			order: 'desc',
		} );

		expect( sortedSites.length ).toBe( 3 );
		expect( sortedSites[ 0 ].ID ).toBe( 2 );
		expect( sortedSites[ 1 ].ID ).toBe( 3 );
		expect( sortedSites[ 2 ].ID ).toBe( 1 );
	} );

	test( 'should sort sites by updated-at ascending', () => {
		const { sortedSites } = useSitesTableSorting( filteredSites, {
			sort: 'updated-at',
			order: 'asc',
		} );

		expect( sortedSites.length ).toBe( 3 );
		expect( sortedSites[ 0 ].ID ).toBe( 1 );
		expect( sortedSites[ 1 ].ID ).toBe( 3 );
		expect( sortedSites[ 2 ].ID ).toBe( 2 );
	} );

	test( 'should sort sites by updated-at descending if unsupported order is provided', () => {
		const { sortedSites } = useSitesTableSorting( filteredSites, {
			sort: 'updated-at',
			order: 'unsupported-order',
		} );

		expect( sortedSites.length ).toBe( 3 );
		expect( sortedSites[ 0 ].ID ).toBe( 2 );
		expect( sortedSites[ 1 ].ID ).toBe( 3 );
		expect( sortedSites[ 2 ].ID ).toBe( 1 );
	} );
} );
