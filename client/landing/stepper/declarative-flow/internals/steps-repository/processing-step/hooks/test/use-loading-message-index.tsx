/**
 * @jest-environment jsdom
 */

import { renderHook, act } from '@testing-library/react';
import { useLoadingMessageIndex } from '../use-loading-message-index';
import type { LoadingMessage } from '../types';

jest.useFakeTimers();

const THREE_MESSAGES: LoadingMessage[] = [
	{ title: 'First', duration: 1000 },
	{ title: 'Second', duration: 1000 },
	{ title: 'Third', duration: Infinity },
];

describe( 'useLoadingMessageIndex', () => {
	test( 'advances through the list', () => {
		const { result } = renderHook( () => useLoadingMessageIndex( THREE_MESSAGES ) );

		expect( result.current ).toBe( 0 );

		act( () => void jest.advanceTimersByTime( 1000 ) );
		expect( result.current ).toBe( 1 );

		act( () => void jest.advanceTimersByTime( 1000 ) );
		expect( result.current ).toBe( 2 );
	} );

	test( 'holds on the last message instead of wrapping', () => {
		const { result } = renderHook( () => useLoadingMessageIndex( THREE_MESSAGES ) );

		act( () => void jest.advanceTimersByTime( 60000 ) );

		expect( result.current ).toBe( 2 );
	} );

	test( 'stops scheduling once the terminal message is reached', () => {
		const setIntervalSpy = jest.spyOn( window, 'setInterval' );
		renderHook( () => useLoadingMessageIndex( THREE_MESSAGES ) );

		act( () => void jest.advanceTimersByTime( 60000 ) );
		const callsAtHold = setIntervalSpy.mock.calls.length;

		act( () => void jest.advanceTimersByTime( 60000 ) );

		expect( setIntervalSpy.mock.calls.length ).toBe( callsAtHold );
		setIntervalSpy.mockRestore();
	} );

	test( 'restarts from the first message when the list changes length', () => {
		const shortList: LoadingMessage[] = [
			{ title: 'Only', duration: 1000 },
			{ title: 'Last', duration: Infinity },
		];
		const { result, rerender } = renderHook(
			( { messages }: { messages: LoadingMessage[] } ) => useLoadingMessageIndex( messages ),
			{ initialProps: { messages: THREE_MESSAGES } }
		);

		act( () => void jest.advanceTimersByTime( 2000 ) );
		expect( result.current ).toBe( 2 );

		rerender( { messages: shortList } );
		expect( result.current ).toBe( 0 );

		act( () => void jest.advanceTimersByTime( 1000 ) );
		expect( result.current ).toBe( 1 );
	} );

	test( 'keeps moving when a message that is not the last one has an unusable duration', () => {
		const badDurations: LoadingMessage[] = [
			{ title: 'First', duration: Infinity },
			{ title: 'Second', duration: 0 },
			{ title: 'Third', duration: Infinity },
		];
		const { result } = renderHook( () => useLoadingMessageIndex( badDurations ) );

		act( () => void jest.advanceTimersByTime( 5000 ) );
		expect( result.current ).toBe( 1 );

		act( () => void jest.advanceTimersByTime( 5000 ) );
		expect( result.current ).toBe( 2 );
	} );

	test( 'never returns a negative index for an empty list', () => {
		const { result } = renderHook( () => useLoadingMessageIndex( [] ) );

		expect( result.current ).toBe( 0 );
	} );
} );
