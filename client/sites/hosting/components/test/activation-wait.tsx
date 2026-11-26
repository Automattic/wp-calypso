/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { ACTIVATION_DEADLINE_MS, useActivationDeadline } from '../activation-wait';

const elapse = async ( ms: number ) => {
	await act( async () => {
		await vi.advanceTimersByTimeAsync( ms );
	} );
};

describe( 'useActivationDeadline', () => {
	beforeEach( () => vi.useFakeTimers() );
	afterEach( () => vi.useRealTimers() );

	it( 'resets after a stalled wait ends and a retry starts', async () => {
		const { result, rerender } = renderHook(
			( { isWaiting } ) => useActivationDeadline( 1, isWaiting ),
			{ initialProps: { isWaiting: true } }
		);

		await elapse( ACTIVATION_DEADLINE_MS );
		expect( result.current ).toBe( true );

		rerender( { isWaiting: false } );
		expect( result.current ).toBe( false );

		rerender( { isWaiting: true } );
		expect( result.current ).toBe( false );

		await elapse( ACTIVATION_DEADLINE_MS );
		expect( result.current ).toBe( true );
	} );
} );
