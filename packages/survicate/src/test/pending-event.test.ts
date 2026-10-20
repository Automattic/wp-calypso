/**
 * @jest-environment jsdom
 */

jest.mock( '../invoke-event', () => ( {
	invokeSurvicateEvent: jest.fn( () => jest.fn() ),
} ) );

import { invokeSurvicateEvent } from '../invoke-event';
import { invokeQueuedSurvicateEvent, queueSurvicateEvent } from '../pending-event';

const mockInvokeSurvicateEvent = invokeSurvicateEvent as jest.Mock;

function clearCookies() {
	document.cookie.split( '; ' ).forEach( ( cookie ) => {
		const [ name ] = cookie.split( '=' );
		document.cookie = `${ name }=; path=/; max-age=0`;
	} );
}

describe( 'queued Survicate events', () => {
	afterEach( () => {
		clearCookies();
		mockInvokeSurvicateEvent.mockClear();
	} );

	test( 'does nothing when the event was not queued', () => {
		invokeQueuedSurvicateEvent( 'migrationStarted' );

		expect( mockInvokeSurvicateEvent ).not.toHaveBeenCalled();
	} );

	test( 'fires a queued event once', () => {
		queueSurvicateEvent( 'migrationStarted' );

		invokeQueuedSurvicateEvent( 'migrationStarted' );
		invokeQueuedSurvicateEvent( 'migrationStarted' );

		expect( mockInvokeSurvicateEvent ).toHaveBeenCalledTimes( 1 );
		expect( mockInvokeSurvicateEvent ).toHaveBeenCalledWith( 'migrationStarted' );
	} );

	test( 'only fires the event that was queued', () => {
		queueSurvicateEvent( 'migrationStarted' );

		invokeQueuedSurvicateEvent( 'migrationCompleted' );

		expect( mockInvokeSurvicateEvent ).not.toHaveBeenCalled();
	} );

	test( 'returns the cleanup from invokeSurvicateEvent', () => {
		const cleanup = jest.fn();
		mockInvokeSurvicateEvent.mockReturnValueOnce( cleanup );
		queueSurvicateEvent( 'migrationStarted' );

		expect( invokeQueuedSurvicateEvent( 'migrationStarted' ) ).toBe( cleanup );
	} );
} );
