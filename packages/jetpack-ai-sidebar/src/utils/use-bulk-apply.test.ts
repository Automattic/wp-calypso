/**
 * @jest-environment jsdom
 */

import { act, renderHook } from '@testing-library/react';
import useBulkApply from './use-bulk-apply';

describe( 'useBulkApply', () => {
	it( 'counts step results and reports one aggregate action', async () => {
		const fire = jest.fn();
		const { result } = renderHook( () => useBulkApply( fire, () => false ) );

		await act( async () => {
			await result.current.runBulkApply( 'edit', [
				async () => true,
				async () => false,
				async () => true,
			] );
		} );

		expect( fire ).toHaveBeenCalledTimes( 1 );
		expect( fire ).toHaveBeenCalledWith( {
			action: 'bulk_accept',
			target: 'edit',
			outcome: 'partial_failed',
			itemCount: 3,
		} );
		expect( result.current.bulkRunning ).toBe( false );
	} );

	it( 'stops without reporting when a step observes a stale post', async () => {
		const fire = jest.fn();
		const later = jest.fn( async () => true );
		const { result } = renderHook( () => useBulkApply( fire, () => false ) );

		await act( async () => {
			await result.current.runBulkApply( 'edit', [ async () => undefined, later ] );
		} );

		expect( later ).not.toHaveBeenCalled();
		expect( fire ).not.toHaveBeenCalled();
		expect( result.current.bulkRunning ).toBe( false );
	} );

	it( 'stops without reporting when the context goes stale between steps', async () => {
		const fire = jest.fn();
		let stale = false;
		const { result } = renderHook( () => useBulkApply( fire, () => stale ) );

		await act( async () => {
			await result.current.runBulkApply( 'edit', [
				async () => {
					stale = true;
					return true;
				},
				async () => true,
			] );
		} );

		expect( fire ).not.toHaveBeenCalled();
		expect( result.current.bulkRunning ).toBe( false );
	} );

	it( 'ignores a second run while one is in flight', async () => {
		const fire = jest.fn();
		let resolveStep: ( value: boolean ) => void = () => {};
		const firstStep = jest.fn(
			() =>
				new Promise< boolean >( ( resolve ) => {
					resolveStep = resolve;
				} )
		);
		const secondRunStep = jest.fn( async () => true );
		const { result } = renderHook( () => useBulkApply( fire, () => false ) );

		let firstRun: Promise< void > = Promise.resolve();
		await act( async () => {
			firstRun = result.current.runBulkApply( 'edit', [ firstStep ] );
		} );
		await act( async () => {
			await result.current.runBulkApply( 'edit', [ secondRunStep ] );
		} );
		await act( async () => {
			resolveStep( true );
			await firstRun;
		} );

		expect( secondRunStep ).not.toHaveBeenCalled();
		expect( fire ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not start while the post context is already stale', async () => {
		const fire = jest.fn();
		const step = jest.fn( async () => true );
		const { result } = renderHook( () => useBulkApply( fire, () => true ) );

		await act( async () => {
			await result.current.runBulkApply( 'edit', [ step ] );
		} );

		expect( step ).not.toHaveBeenCalled();
		expect( fire ).not.toHaveBeenCalled();
	} );
} );
