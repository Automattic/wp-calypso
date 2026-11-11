/**
 * @jest-environment jsdom
 */

virt { vi } from 'vitest';
jest.mock( '@wordpress/data', () => ( {
	select: vi.fn(),
	subscribe: vi.fn( () => vi.fn() ),
} ) );

vi.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: vi.fn(),
} ) );

vi.mock( '@automattic/calypso-support-session', () => ( {
	isSupportSession: vi.fn( () => false ),
} ) );

import { invokeSurvicateEventOnce } from '../invoke-event-once';

describe( 'invokeSurvicateEventOnce', () => {
	const invokeEvent = vi.fn();

	beforeEach( () => {
		window._sva = { invokeEvent };
	} );

	afterEach( () => {
		invokeEvent.mockClear();
		window._sva = undefined;
		window.localStorage.clear();
		document.body.innerHTML = '';
	} );

	test( 'should invoke the event once per key', () => {
		invokeSurvicateEventOnce( 'migrationCompleted', '42:1700000000' );
		invokeSurvicateEventOnce( 'migrationCompleted', '42:1700000000' );
		expect( invokeEvent ).toHaveBeenCalledTimes( 1 );
		expect( invokeEvent ).toHaveBeenCalledWith( 'migrationCompleted' );

		invokeSurvicateEventOnce( 'migrationCompleted', '42:1700009999' );
		expect( invokeEvent ).toHaveBeenCalledTimes( 2 );
	} );

	test( 'should keep the same key apart per event', () => {
		invokeSurvicateEventOnce( 'migrationStarted', '42:1700000000' );
		invokeSurvicateEventOnce( 'migrationCompleted', '42:1700000000' );
		expect( invokeEvent ).toHaveBeenCalledTimes( 2 );
	} );

	test( 'should ask again later when the event was suppressed', () => {
		const modal = document.createElement( 'div' );
		modal.setAttribute( 'role', 'dialog' );
		modal.setAttribute( 'aria-modal', 'true' );
		( modal as HTMLElement & { checkVisibility?: () => boolean } ).checkVisibility = () => true;
		document.body.appendChild( modal );

		invokeSurvicateEventOnce( 'migrationCompleted', '42:1700000000' );
		expect( invokeEvent ).not.toHaveBeenCalled();

		modal.remove();
		invokeSurvicateEventOnce( 'migrationCompleted', '42:1700000000' );
		expect( invokeEvent ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should wait for the SDK before marking a deferred event as invoked', () => {
		window._sva = undefined;

		invokeSurvicateEventOnce( 'migrationCompleted', '42:1700000000' );
		expect( window.localStorage.length ).toBe( 0 );

		window._sva = { invokeEvent };
		window.dispatchEvent( new Event( 'SurvicateReady' ) );
		expect( invokeEvent ).toHaveBeenCalledTimes( 1 );

		invokeSurvicateEventOnce( 'migrationCompleted', '42:1700000000' );
		expect( invokeEvent ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should ask again later when the screen was left before the SDK was ready', () => {
		window._sva = undefined;

		const cleanup = invokeSurvicateEventOnce( 'migrationCompleted', '42:1700000000' );
		cleanup();
		window._sva = { invokeEvent };
		window.dispatchEvent( new Event( 'SurvicateReady' ) );
		expect( invokeEvent ).not.toHaveBeenCalled();

		invokeSurvicateEventOnce( 'migrationCompleted', '42:1700000000' );
		expect( invokeEvent ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should ask again later when a deferred event was suppressed at SurvicateReady time', () => {
		window._sva = undefined;

		invokeSurvicateEventOnce( 'migrationCompleted', '42:1700000000' );
		const modal = document.createElement( 'div' );
		modal.setAttribute( 'role', 'dialog' );
		modal.setAttribute( 'aria-modal', 'true' );
		( modal as HTMLElement & { checkVisibility?: () => boolean } ).checkVisibility = () => true;
		document.body.appendChild( modal );
		window._sva = { invokeEvent };
		window.dispatchEvent( new Event( 'SurvicateReady' ) );
		expect( invokeEvent ).not.toHaveBeenCalled();

		modal.remove();
		invokeSurvicateEventOnce( 'migrationCompleted', '42:1700000000' );
		expect( invokeEvent ).toHaveBeenCalledTimes( 1 );
	} );
} );
