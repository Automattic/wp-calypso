/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import usePressableAddonCapacityContext, {
	getPressableAddonType,
} from '../use-pressable-addon-capacity-context';

const mockGetPressablePlan = jest.fn();

jest.mock(
	'calypso/a8c-for-agencies/sections/marketplace/pressable-overview/hooks/use-get-pressable-plan',
	() => ( {
		__esModule: true,
		default: () => mockGetPressablePlan,
	} )
);

describe( 'getPressableAddonType', () => {
	it( 'returns "sites" for sites addon slugs', () => {
		expect( getPressableAddonType( 'pressable-addon-sites-1' ) ).toBe( 'sites' );
		expect( getPressableAddonType( 'pressable-addon-sites-10' ) ).toBe( 'sites' );
	} );

	it( 'returns "storage" for storage addon slugs', () => {
		expect( getPressableAddonType( 'pressable-addon-storage-50gb' ) ).toBe( 'storage' );
	} );

	it( 'returns "visits" for visits addon slugs', () => {
		expect( getPressableAddonType( 'pressable-addon-visits-10k' ) ).toBe( 'visits' );
	} );

	it( 'returns "unknown" for unrecognized slugs', () => {
		expect( getPressableAddonType( 'pressable-premium' ) ).toBe( 'unknown' );
		expect( getPressableAddonType( 'jetpack-complete' ) ).toBe( 'unknown' );
	} );
} );

describe( 'usePressableAddonCapacityContext', () => {
	beforeEach( () => {
		mockGetPressablePlan.mockReset();
	} );

	it( 'returns null when plan is not found', () => {
		mockGetPressablePlan.mockReturnValue( undefined );

		const { result } = renderHook( () =>
			usePressableAddonCapacityContext( 'pressable-addon-sites-1' )
		);

		expect( result.current ).toBeNull();
	} );

	it( 'returns capacity context for a sites addon', () => {
		mockGetPressablePlan.mockReturnValue( {
			slug: 'pressable-addon-sites-1',
			install: 1,
			storage: 10,
			visits: 5000,
			worker: 0,
			category: '',
		} );

		const { result } = renderHook( () =>
			usePressableAddonCapacityContext( 'pressable-addon-sites-1' )
		);

		expect( result.current ).toEqual( {
			type: 'sites',
			install: 1,
			storage: 10,
			visits: 5000,
			phpMemory: 0,
			formattedInstall: '1',
			formattedStorage: '10 GB',
			formattedVisits: '5,000',
			formattedPhpMemory: '0 MB',
		} );
	} );

	it( 'returns capacity context for a storage addon', () => {
		mockGetPressablePlan.mockReturnValue( {
			slug: 'pressable-addon-storage-50gb',
			install: 0,
			storage: 50,
			visits: 0,
			worker: 0,
			category: '',
		} );

		const { result } = renderHook( () =>
			usePressableAddonCapacityContext( 'pressable-addon-storage-50gb' )
		);

		expect( result.current ).toEqual( {
			type: 'storage',
			install: 0,
			storage: 50,
			visits: 0,
			phpMemory: 0,
			formattedInstall: '0',
			formattedStorage: '50 GB',
			formattedVisits: '0',
			formattedPhpMemory: '0 MB',
		} );
	} );

	it( 'returns capacity context for a visits addon', () => {
		mockGetPressablePlan.mockReturnValue( {
			slug: 'pressable-addon-visits-50k',
			install: 0,
			storage: 0,
			visits: 50000,
			worker: 0,
			category: '',
		} );

		const { result } = renderHook( () =>
			usePressableAddonCapacityContext( 'pressable-addon-visits-50k' )
		);

		expect( result.current ).toEqual( {
			type: 'visits',
			install: 0,
			storage: 0,
			visits: 50000,
			phpMemory: 0,
			formattedInstall: '0',
			formattedStorage: '0 GB',
			formattedVisits: '50,000',
			formattedPhpMemory: '0 MB',
		} );
	} );

	it( 'returns "unknown" type for unrecognized addon slugs', () => {
		mockGetPressablePlan.mockReturnValue( {
			slug: 'pressable-addon-custom',
			install: 2,
			storage: 20,
			visits: 10000,
			worker: 0,
			category: '',
		} );

		const { result } = renderHook( () =>
			usePressableAddonCapacityContext( 'pressable-addon-custom' )
		);

		expect( result.current ).toMatchObject( { type: 'unknown' } );
	} );

	it( 'passes the product slug to getPressablePlan', () => {
		mockGetPressablePlan.mockReturnValue( undefined );

		renderHook( () => usePressableAddonCapacityContext( 'pressable-addon-sites-5' ) );

		expect( mockGetPressablePlan ).toHaveBeenCalledWith( 'pressable-addon-sites-5' );
	} );
} );
