/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import { useSelect } from '@wordpress/data';
import { useSiteMigrationStatus } from '../use-site-migration-status';

// Mock the SITE_STORE
jest.mock( 'calypso/landing/stepper/stores', () => ( {
	SITE_STORE: 'site-store',
} ) );

// Mock the WordPress data store with combineReducers
jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn(),
	combineReducers: jest.fn( ( reducers ) => reducers ),
	createReduxStore: jest.fn(),
	register: jest.fn(),
} ) );

describe( 'useSiteMigrationStatus', () => {
	const mockSite = {
		ID: 123,
		site_migration: {
			is_complete: false,
			in_progress: true,
		},
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should return site data and migration status', () => {
		( useSelect as jest.Mock ).mockImplementation( ( selector ) => {
			return selector( ( storeName: string ) => {
				if ( storeName === 'site-store' ) {
					return {
						getSite: () => mockSite,
					};
				}
				return {};
			} );
		} );

		const { result } = renderHook( () => useSiteMigrationStatus( 123 ) );

		expect( result.current ).toEqual( {
			site: mockSite,
			isMigrationCompleted: false,
			isMigrationInProgress: true,
		} );
	} );

	it( 'should handle undefined site data', () => {
		( useSelect as jest.Mock ).mockImplementation( ( selector ) => {
			return selector( ( storeName: string ) => {
				if ( storeName === 'site-store' ) {
					return {
						getSite: () => undefined,
					};
				}
				return {};
			} );
		} );

		const { result } = renderHook( () => useSiteMigrationStatus( 123 ) );

		expect( result.current ).toEqual( {
			site: undefined,
			isMigrationCompleted: false,
			isMigrationInProgress: false,
		} );
	} );

	it( 'should handle site without migration data', () => {
		( useSelect as jest.Mock ).mockImplementation( ( selector ) => {
			return selector( ( storeName: string ) => {
				if ( storeName === 'site-store' ) {
					return {
						getSite: () => ( { ID: 123 } ),
					};
				}
				return {};
			} );
		} );

		const { result } = renderHook( () => useSiteMigrationStatus( 123 ) );

		expect( result.current ).toEqual( {
			site: { ID: 123 },
			isMigrationCompleted: false,
			isMigrationInProgress: false,
		} );
	} );
} );
