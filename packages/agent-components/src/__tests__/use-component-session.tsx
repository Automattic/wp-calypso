import { act, renderHook } from '@testing-library/react';
import { StrictMode } from 'react';
import { useComponentSession } from '../use-component-session';
import { applied, completed, opening } from './fixtures';

beforeEach( () => {
	jest.useFakeTimers().setSystemTime( new Date( '2026-09-30T10:00:00Z' ) );
} );
afterEach( () => {
	jest.clearAllTimers();
	jest.useRealTimers();
} );

it( 'keeps one active session after StrictMode effect replay and disposes it on unmount', async () => {
	const transport = jest.fn().mockResolvedValue( applied() );
	const onContinue = jest.fn().mockResolvedValue( undefined );
	const { result, unmount } = renderHook(
		() =>
			useComponentSession( {
				result: opening(),
				transport,
				onContinue,
				createRequestId: () => 'request-123',
			} ),
		{ wrapper: StrictMode }
	);
	expect( result.current.phase ).toBe( 'ready' );
	expect( jest.getTimerCount() ).toBe( 1 );
	await act( () => result.current.submit( 'tool.execute' ) );
	expect( result.current.result ).toEqual( completed() );
	expect( transport ).toHaveBeenCalledTimes( 1 );
	expect( onContinue ).toHaveBeenCalledTimes( 1 );
	unmount();
	jest.runAllTicks();
	expect( jest.getTimerCount() ).toBe( 0 );
} );

it( 'ignores an in-flight completion after the hook unmounts', async () => {
	let resolve: ( value: unknown ) => void = () => {};
	const transport = jest.fn(
		() =>
			new Promise( ( done ) => {
				resolve = done;
			} )
	);
	const onContinue = jest.fn();
	const { result, unmount } = renderHook( () =>
		useComponentSession( {
			result: opening(),
			transport,
			onContinue,
			createRequestId: () => 'request-123',
		} )
	);
	let submission: Promise< void > = Promise.resolve();
	act( () => {
		submission = result.current.submit( 'tool.execute' );
	} );
	unmount();
	resolve( applied() );
	await submission;
	expect( onContinue ).not.toHaveBeenCalled();
	expect( jest.getTimerCount() ).toBe( 0 );
} );

it( 'disposes the old instance before exposing a replacement interaction', async () => {
	let resolve: ( value: unknown ) => void = () => {};
	const transport = jest.fn(
		() =>
			new Promise( ( done ) => {
				resolve = done;
			} )
	);
	const onContinue = jest.fn();
	const { result, rerender } = renderHook(
		( { instanceId } ) =>
			useComponentSession( {
				result: { ...opening(), instanceId },
				transport,
				onContinue,
				createRequestId: () => 'request-123',
			} ),
		{ initialProps: { instanceId: 'instance-123' } }
	);
	const previous = result.current;
	let submission: Promise< void > = Promise.resolve();
	act( () => {
		submission = previous.submit( 'tool.execute' );
	} );
	rerender( { instanceId: 'instance-456' } );
	expect( result.current.result?.instanceId ).toBe( 'instance-456' );
	expect( result.current.phase ).toBe( 'ready' );
	resolve( applied() );
	await submission;
	await previous.submit( 'tool.execute' );
	expect( transport ).toHaveBeenCalledTimes( 1 );
	expect( onContinue ).not.toHaveBeenCalled();
	expect( result.current.result?.instanceId ).toBe( 'instance-456' );
} );
