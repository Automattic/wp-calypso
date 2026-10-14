/** @jest-environment jsdom */
import { renderHook } from '@testing-library/react';
import { StrictMode } from 'react';
import { useStartDesigning } from '../use-start-designing';
import type { Redesign } from '../api';

const run = { id: 'rd_1', site_id: 1 } as Redesign;
const submitChatMessage = jest.fn( async () => undefined );
let previousActions: typeof window.__agentsManagerActions;
beforeEach( () => {
	previousActions = window.__agentsManagerActions;
	window.__agentsManagerActions = { submitChatMessage };
	submitChatMessage.mockClear();
	window.history.replaceState(
		{},
		'',
		'/site-redesign/example.wordpress.com?start-designing=1&redesign=rd_1'
	);
} );
afterEach( () => {
	window.__agentsManagerActions = previousActions;
	window.history.replaceState( {}, '', '/' );
} );

test( 'waits for the native chat and owned run, sends once, and consumes only the entry marker', () => {
	const { rerender } = renderHook(
		( { current, connected, answering } ) =>
			useStartDesigning( current, connected, answering, false ),
		{
			initialProps: { current: null as Redesign | null, connected: false, answering: false },
			wrapper: StrictMode,
		}
	);
	rerender( { current: run, connected: false, answering: false } );
	rerender( { current: run, connected: true, answering: true } );
	expect( submitChatMessage ).not.toHaveBeenCalled();
	rerender( { current: run, connected: true, answering: false } );
	expect( submitChatMessage ).toHaveBeenCalledWith( 'Help me redesign my existing site.' );
	expect( window.location.search ).toBe( '?redesign=rd_1' );
	rerender( { current: { ...run }, connected: true, answering: false } );
	rerender( { current: { ...run, id: 'rd_fresh' }, connected: false, answering: false } );
	rerender( { current: { ...run, id: 'rd_fresh' }, connected: true, answering: false } );
	expect( submitChatMessage ).toHaveBeenCalledTimes( 1 );
} );

test( 'does not automatically send on a direct visit or reload after the marker was consumed', () => {
	window.history.replaceState( {}, '', '/site-redesign/example.wordpress.com?redesign=rd_1' );
	renderHook( () => useStartDesigning( run, true, false, false ) );
	expect( submitChatMessage ).not.toHaveBeenCalled();
} );

test( 'does not start an interview on a paid checkout return', () => {
	renderHook( () => useStartDesigning( run, true, false, true ) );
	expect( submitChatMessage ).not.toHaveBeenCalled();
} );
