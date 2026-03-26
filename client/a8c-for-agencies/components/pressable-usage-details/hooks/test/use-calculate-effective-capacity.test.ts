/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react';
import useCalculateEffectiveCapacity from '../use-calculate-effective-capacity';
import type { License } from 'calypso/state/partner-portal/types';

const mockGetPressablePlan = jest.fn();

jest.mock(
	'calypso/a8c-for-agencies/sections/marketplace/pressable-overview/hooks/use-get-pressable-plan',
	() => ( {
		__esModule: true,
		default: () => mockGetPressablePlan,
	} )
);

const basePlan = { install: 5, storage: 50, visits: 100000 };

const buildLicense = ( overrides: Partial< License > = {} ): License =>
	( {
		licenseId: 1,
		licenseKey: 'pressable-addon-sites-1',
		productId: 1,
		product: 'pressable-addon-sites-1',
		userId: null,
		username: null,
		blogId: null,
		siteUrl: null,
		hasDownloads: false,
		issuedAt: '2026-01-01T00:00:00Z',
		attachedAt: null,
		revokedAt: null,
		ownerType: null,
		quantity: 1,
		parentLicenseId: null,
		meta: {},
		referral: null,
		...overrides,
	} ) as License;

describe( 'useCalculateEffectiveCapacity', () => {
	beforeEach( () => {
		mockGetPressablePlan.mockReset();
	} );

	it( 'returns base plan when no licenses are provided', () => {
		const { result } = renderHook( () => useCalculateEffectiveCapacity() );
		const capacity = result.current( basePlan );

		expect( capacity ).toEqual( basePlan );
	} );

	it( 'returns base plan when licenses array is empty', () => {
		const { result } = renderHook( () => useCalculateEffectiveCapacity() );
		const capacity = result.current( basePlan, [] );

		expect( capacity ).toEqual( basePlan );
	} );

	it( 'adds addon capacity to base plan', () => {
		mockGetPressablePlan.mockReturnValue( {
			slug: 'pressable-addon-sites-1',
			install: 1,
			storage: 10,
			visits: 5000,
			worker: 0,
			category: '',
		} );

		const { result } = renderHook( () => useCalculateEffectiveCapacity() );
		const capacity = result.current( basePlan, [ buildLicense() ] );

		expect( capacity ).toEqual( {
			install: 6,
			storage: 60,
			visits: 105000,
		} );
	} );

	it( 'multiplies addon capacity by license quantity', () => {
		mockGetPressablePlan.mockReturnValue( {
			slug: 'pressable-addon-sites-1',
			install: 1,
			storage: 10,
			visits: 5000,
			worker: 0,
			category: '',
		} );

		const { result } = renderHook( () => useCalculateEffectiveCapacity() );
		const capacity = result.current( basePlan, [ buildLicense( { quantity: 3 } ) ] );

		expect( capacity ).toEqual( {
			install: 8,
			storage: 80,
			visits: 115000,
		} );
	} );

	it( 'treats null or zero quantity as 1', () => {
		mockGetPressablePlan.mockReturnValue( {
			slug: 'pressable-addon-sites-1',
			install: 1,
			storage: 10,
			visits: 5000,
			worker: 0,
			category: '',
		} );

		const { result } = renderHook( () => useCalculateEffectiveCapacity() );

		const capacityNull = result.current( basePlan, [ buildLicense( { quantity: null } ) ] );
		expect( capacityNull ).toEqual( { install: 6, storage: 60, visits: 105000 } );

		const capacityZero = result.current( basePlan, [ buildLicense( { quantity: 0 } ) ] );
		expect( capacityZero ).toEqual( { install: 6, storage: 60, visits: 105000 } );
	} );

	it( 'skips referral licenses', () => {
		const { result } = renderHook( () => useCalculateEffectiveCapacity() );
		const capacity = result.current( basePlan, [
			buildLicense( { referral: { id: 10 } as License[ 'referral' ] } ),
		] );

		expect( capacity ).toEqual( basePlan );
		expect( mockGetPressablePlan ).not.toHaveBeenCalled();
	} );

	it( 'skips revoked licenses', () => {
		const { result } = renderHook( () => useCalculateEffectiveCapacity() );
		const capacity = result.current( basePlan, [
			buildLicense( { revokedAt: '2026-02-01T00:00:00Z' } ),
		] );

		expect( capacity ).toEqual( basePlan );
		expect( mockGetPressablePlan ).not.toHaveBeenCalled();
	} );

	it( 'skips non-addon licenses', () => {
		const { result } = renderHook( () => useCalculateEffectiveCapacity() );
		const capacity = result.current( basePlan, [
			buildLicense( { licenseKey: 'pressable-premium' } ),
		] );

		expect( capacity ).toEqual( basePlan );
		expect( mockGetPressablePlan ).not.toHaveBeenCalled();
	} );

	it( 'skips addon when getPressablePlan returns falsy', () => {
		mockGetPressablePlan.mockReturnValue( undefined );

		const { result } = renderHook( () => useCalculateEffectiveCapacity() );
		const capacity = result.current( basePlan, [ buildLicense() ] );

		expect( capacity ).toEqual( basePlan );
	} );

	it( 'normalizes license key by splitting on underscore', () => {
		mockGetPressablePlan.mockReturnValue( {
			slug: 'pressable-addon-sites-1',
			install: 1,
			storage: 10,
			visits: 5000,
			worker: 0,
			category: '',
		} );

		const { result } = renderHook( () => useCalculateEffectiveCapacity() );
		result.current( basePlan, [
			buildLicense( { licenseKey: 'pressable-addon-sites-1_abc123' } ),
		] );

		expect( mockGetPressablePlan ).toHaveBeenCalledWith( 'pressable-addon-sites-1' );
	} );

	it( 'accumulates capacity from multiple valid addons', () => {
		mockGetPressablePlan.mockImplementation( ( slug: string ) => {
			if ( slug === 'pressable-addon-sites-1' ) {
				return { slug, install: 1, storage: 10, visits: 5000, worker: 0, category: '' };
			}
			if ( slug === 'pressable-addon-storage-50gb' ) {
				return { slug, install: 0, storage: 50, visits: 0, worker: 0, category: '' };
			}
			return undefined;
		} );

		const { result } = renderHook( () => useCalculateEffectiveCapacity() );
		const capacity = result.current( basePlan, [
			buildLicense( { licenseKey: 'pressable-addon-sites-1' } ),
			buildLicense( { licenseKey: 'pressable-addon-storage-50gb' } ),
		] );

		expect( capacity ).toEqual( {
			install: 6,
			storage: 110,
			visits: 105000,
		} );
	} );
} );
