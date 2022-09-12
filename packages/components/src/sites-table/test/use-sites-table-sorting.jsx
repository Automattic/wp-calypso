/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react-hooks';
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

	test( 'should not sort sites if unsupported sortKey is provided', () => {
		const { result } = renderHook( () =>
			useSitesTableSorting( filteredSites, {
				sortKey: 'sort-that-is-not-supported',
				sortOrder: 'asc',
			} )
		);

		expect( result.current.sortedSites.length ).toBe( 3 );
		expect( result.current.sortedSites[ 0 ].ID ).toBe( 1 );
		expect( result.current.sortedSites[ 1 ].ID ).toBe( 2 );
		expect( result.current.sortedSites[ 2 ].ID ).toBe( 3 );
	} );

	test( 'should sort sites by updatedAt descending', () => {
		const { result } = renderHook( () =>
			useSitesTableSorting( filteredSites, {
				sortKey: 'updatedAt',
				sortOrder: 'desc',
			} )
		);

		expect( result.current.sortedSites.length ).toBe( 3 );
		expect( result.current.sortedSites[ 0 ].ID ).toBe( 2 );
		expect( result.current.sortedSites[ 1 ].ID ).toBe( 3 );
		expect( result.current.sortedSites[ 2 ].ID ).toBe( 1 );
	} );

	test( 'should sort sites by updatedAt ascending', () => {
		const { result } = renderHook( () =>
			useSitesTableSorting( filteredSites, {
				sortKey: 'updatedAt',
				sortOrder: 'asc',
			} )
		);

		expect( result.current.sortedSites.length ).toBe( 3 );
		expect( result.current.sortedSites[ 0 ].ID ).toBe( 1 );
		expect( result.current.sortedSites[ 1 ].ID ).toBe( 3 );
		expect( result.current.sortedSites[ 2 ].ID ).toBe( 2 );
	} );

	test( 'sorting maintains object equality', () => {
		// Object equality is important for memoizing the site table row

		const { result, rerender } = renderHook(
			( { sortOrder } ) =>
				useSitesTableSorting( filteredSites, { sortKey: 'updatedAt', sortOrder } ),
			{ initialProps: { sortOrder: 'asc' } }
		);

		expect( result.current.sortedSites ).toHaveLength( 3 );
		expect( result.current.sortedSites[ 0 ] ).toBe( filteredSites[ 0 ] );
		expect( result.current.sortedSites[ 1 ] ).toBe( filteredSites[ 2 ] );
		expect( result.current.sortedSites[ 2 ] ).toBe( filteredSites[ 1 ] );

		rerender( { sortOrder: 'desc' } );

		expect( result.current.sortedSites ).toHaveLength( 3 );
		expect( result.current.sortedSites[ 0 ] ).toBe( filteredSites[ 1 ] );
		expect( result.current.sortedSites[ 1 ] ).toBe( filteredSites[ 2 ] );
		expect( result.current.sortedSites[ 2 ] ).toBe( filteredSites[ 0 ] );
	} );
} );
