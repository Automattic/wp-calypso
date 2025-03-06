/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import {
	useSitesListFilterDelete,
	SitesFilterDeleteOptions,
} from '../src/use-sites-list-filter-delete';

// Mock the MinimumSite type for testing
interface MockSite {
	id: number;
	name: string;
	status: string;
	is_deleted: boolean;
}

describe( 'useSitesListFilterDelete', () => {
	// Sample test data
	const testSites: MockSite[] = [
		{ id: 1, name: 'Site 1', status: 'active', is_deleted: false },
		{ id: 2, name: 'Site 2', status: 'inactive', is_deleted: false },
		{ id: 3, name: 'Site 3', status: 'active', is_deleted: true },
		{ id: 4, name: 'Test Site', status: 'pending', is_deleted: false },
		{ id: 5, name: 'Another Site', status: 'active', is_deleted: false },
	];

	test( 'filters out deleted sites', () => {
		const options: SitesFilterDeleteOptions = {
			shouldApplyFilter: true,
		};

		const { result } = renderHook( () => useSitesListFilterDelete( testSites, options ) );

		const filteredSites = result.current;
		expect( filteredSites ).toHaveLength( 4 );
		expect( filteredSites.every( ( site ) => ! site.is_deleted ) ).toBe( true );
		expect( filteredSites.map( ( site ) => site.id ) ).toEqual( [ 1, 2, 4, 5 ] );
	} );

	test( 'does not filter out deleted sites', () => {
		const options: SitesFilterDeleteOptions = {
			shouldApplyFilter: false,
		};
		const { result } = renderHook( () => useSitesListFilterDelete( testSites, options ) );

		const filteredSites = result.current;
		expect( filteredSites ).toHaveLength( 5 );
		expect( filteredSites.every( ( site ) => ! site.is_deleted ) ).toBe( false );
	} );

	test( 'recalculates when dependencies change', () => {
		const { result, rerender } = renderHook(
			( props ) => useSitesListFilterDelete( props.sites, props.options ),
			{
				initialProps: {
					sites: testSites,
					options: {
						shouldApplyFilter: true,
					},
				},
			}
		);

		// Initial render with no filters should exclude deleted sites
		expect( result.current ).toHaveLength( 4 );
		expect( result.current.every( ( site ) => ! site.is_deleted ) ).toBe( true );

		// Re-render with search, should include all sites
		rerender( {
			sites: testSites,
			options: { shouldApplyFilter: false },
		} );
		expect( result.current ).toHaveLength( 5 );

		// Re-render with different sites array
		const newSites = testSites.slice( 0, 3 );
		rerender( {
			sites: newSites,
			options: {
				shouldApplyFilter: true,
			},
		} );
		expect( result.current ).toHaveLength( 2 );
		expect( result.current.map( ( site ) => site.id ) ).toEqual( [ 1, 2 ] );
	} );
} );
