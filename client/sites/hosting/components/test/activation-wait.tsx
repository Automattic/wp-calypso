/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { ACTIVATION_DEADLINE_MS, useActivationDeadline } from '../activation-wait';

const elapse = async ( ms: number ) => {
	await act( async () => {
		await jest.advanceTimersByTimeAsync( ms );
	} );
};

describe( 'useActivationDeadline', () => {
	beforeEach( () => jest.useFakeTimers() );
	afterEach( () => jest.useRealTimers() );

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
