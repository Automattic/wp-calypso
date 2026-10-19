/**
 * @jest-environment jsdom
 */

jest.mock( '@automattic/calypso-analytics', () => {
	const { EventEmitter } = jest.requireActual( 'events' );
	return { analyticsEvents: new EventEmitter() };
} );

jest.mock( '../invoke-event', () => ( {
	invokeSurvicateEvent: jest.fn( () => jest.fn() ),
	invokeSurvicateEventAfterModalsClose: jest.fn( () => jest.fn() ),
} ) );

import { analyticsEvents } from '@automattic/calypso-analytics';
import { invokeSurvicateEvent, invokeSurvicateEventAfterModalsClose } from '../invoke-event';
import { forwardTracksEventsToSurvicate, SURVICATE_TRACKS_EVENTS } from '../tracks-events';

const mockInvokeSurvicateEvent = invokeSurvicateEvent as jest.Mock;
const mockInvokeAfterModalsClose = invokeSurvicateEventAfterModalsClose as jest.Mock;

const EVENTS = {
	calypso_test_action_completed: {},
	calypso_test_modal_action_completed: { afterModalsClose: true },
};

function recordTracksEvent( eventName: string ) {
	analyticsEvents.emit( 'record-event', eventName, {} );
}

describe( 'forwardTracksEventsToSurvicate', () => {
	let stopForwarding: () => void;

	beforeEach( () => {
		jest.useFakeTimers();
		stopForwarding = forwardTracksEventsToSurvicate( EVENTS );
	} );

	afterEach( () => {
		stopForwarding();
		jest.useRealTimers();
		mockInvokeSurvicateEvent.mockClear();
		mockInvokeAfterModalsClose.mockClear();
	} );

	test( 'forwards an allowlisted event under its Tracks name', () => {
		recordTracksEvent( 'calypso_test_action_completed' );
		jest.runAllTimers();

		expect( mockInvokeSurvicateEvent ).toHaveBeenCalledWith( 'calypso_test_action_completed' );
		expect( mockInvokeAfterModalsClose ).not.toHaveBeenCalled();
	} );

	test( 'waits for modals to close when the event asks for it', () => {
		recordTracksEvent( 'calypso_test_modal_action_completed' );
		jest.runAllTimers();

		expect( mockInvokeAfterModalsClose ).toHaveBeenCalledWith(
			'calypso_test_modal_action_completed'
		);
		expect( mockInvokeSurvicateEvent ).not.toHaveBeenCalled();
	} );

	test( 'ignores events that are not allowlisted', () => {
		recordTracksEvent( 'calypso_test_button_click' );
		recordTracksEvent( 'calypso_survicate_survey_suppressed' );
		recordTracksEvent( 'toString' );
		jest.runAllTimers();

		expect( mockInvokeSurvicateEvent ).not.toHaveBeenCalled();
		expect( mockInvokeAfterModalsClose ).not.toHaveBeenCalled();
	} );

	test( 'invokes a burst of the same event once', () => {
		recordTracksEvent( 'calypso_test_action_completed' );
		recordTracksEvent( 'calypso_test_action_completed' );
		recordTracksEvent( 'calypso_test_action_completed' );
		jest.runAllTimers();

		expect( mockInvokeSurvicateEvent ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'cancels a pending invoke of the same event when it is recorded again', () => {
		const cancel = jest.fn();
		mockInvokeAfterModalsClose.mockReturnValueOnce( cancel );

		recordTracksEvent( 'calypso_test_modal_action_completed' );
		jest.runAllTimers();
		recordTracksEvent( 'calypso_test_modal_action_completed' );

		expect( cancel ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'stops forwarding and cancels pending invokes on cleanup', () => {
		const cancel = jest.fn();
		mockInvokeAfterModalsClose.mockReturnValueOnce( cancel );

		recordTracksEvent( 'calypso_test_modal_action_completed' );
		jest.runAllTimers();
		recordTracksEvent( 'calypso_test_action_completed' );
		stopForwarding();
		jest.runAllTimers();
		recordTracksEvent( 'calypso_test_action_completed' );
		jest.runAllTimers();

		expect( cancel ).toHaveBeenCalledTimes( 1 );
		expect( mockInvokeSurvicateEvent ).not.toHaveBeenCalled();
	} );
} );

describe( 'SURVICATE_TRACKS_EVENTS', () => {
	test( 'never forwards a Survicate Tracks event, which would forward itself', () => {
		expect(
			Object.keys( SURVICATE_TRACKS_EVENTS ).filter( ( name ) =>
				name.startsWith( 'calypso_survicate_' )
			)
		).toEqual( [] );
	} );
} );
