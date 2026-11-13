/**
 * @vitest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import {
	A4A_MIGRATED_SITE_TAG,
	A4A_MIGRATED_SITE_TAG_PRESSABLE_INCENTIVE_2026,
} from '../../lib/constants';
import useCanTagSitesForCommission from '../use-can-tag-sites-for-commission';

function createWrapper() {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	return ( { children }: { children: React.ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);
}

function mockAgency( startDate?: string ) {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/wpcom/v2/agency' )
		.reply( 200, [
			{
				id: 1,
				name: 'Test Agency',
				third_party: { pressable: { usage: { start_date: startDate } } },
			},
		] );
}

async function renderLoadedHook( agency: nock.Scope ) {
	const { result } = renderHook( () => useCanTagSitesForCommission(), {
		wrapper: createWrapper(),
	} );
	await waitFor( () => expect( result.current.isLoading ).toBe( false ) );
	// A failed request also leaves the agency undefined, which most cases read as eligible.
	expect( agency.isDone() ).toBe( true );
	return result;
}

describe( 'useCanTagSitesForCommission', () => {
	afterEach( () => {
		nock.cleanAll();
	} );

	test( 'returns false and omits the incentive tag while the agency is still loading', async () => {
		const agency = mockAgency();

		const { result } = renderHook( () => useCanTagSitesForCommission(), {
			wrapper: createWrapper(),
		} );

		expect( result.current.isLoading ).toBe( true );
		expect( result.current.canTagSitesForCommission ).toBe( false );
		expect( result.current.migrationTags ).toEqual( [ A4A_MIGRATED_SITE_TAG ] );

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );
		expect( agency.isDone() ).toBe( true );
	} );

	test( 'returns canTagSitesForCommission true and includes incentive tag when no start_date', async () => {
		const result = await renderLoadedHook( mockAgency() );

		expect( result.current.canTagSitesForCommission ).toBe( true );
		expect( result.current.migrationTags ).toEqual( [
			A4A_MIGRATED_SITE_TAG,
			A4A_MIGRATED_SITE_TAG_PRESSABLE_INCENTIVE_2026,
		] );
	} );

	test( 'returns true and includes incentive tag when start_date is empty string', async () => {
		const result = await renderLoadedHook( mockAgency( '' ) );

		expect( result.current.canTagSitesForCommission ).toBe( true );
		expect( result.current.migrationTags ).toEqual( [
			A4A_MIGRATED_SITE_TAG,
			A4A_MIGRATED_SITE_TAG_PRESSABLE_INCENTIVE_2026,
		] );
	} );

	test( 'returns true when start_date is on or before cutoff (2025-08-10)', async () => {
		const result = await renderLoadedHook( mockAgency( '2025-08-10' ) );

		expect( result.current.canTagSitesForCommission ).toBe( true );
		expect( result.current.migrationTags ).toEqual( [
			A4A_MIGRATED_SITE_TAG,
			A4A_MIGRATED_SITE_TAG_PRESSABLE_INCENTIVE_2026,
		] );
	} );

	test( 'returns false when start_date is in gap (2025-08-11 to 2026-02-10)', async () => {
		const result = await renderLoadedHook( mockAgency( '2025-08-11' ) );

		expect( result.current.canTagSitesForCommission ).toBe( false );
		expect( result.current.migrationTags ).toEqual( [ A4A_MIGRATED_SITE_TAG ] );
	} );

	test( 'returns true when start_date is on or after promo start (2026-02-11)', async () => {
		const result = await renderLoadedHook( mockAgency( '2026-02-11' ) );

		expect( result.current.canTagSitesForCommission ).toBe( true );
		expect( result.current.migrationTags ).toContain(
			A4A_MIGRATED_SITE_TAG_PRESSABLE_INCENTIVE_2026
		);
	} );
} );
