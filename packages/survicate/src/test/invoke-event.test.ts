/**
 * @jest-environment jsdom
 */

jest.mock( '@wordpress/data', () => ( {
	select: jest.fn(),
	subscribe: jest.fn( () => jest.fn() ),
} ) );

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { select, subscribe } from '@wordpress/data';
import { invokeSurvicateEvent, observeHelpCenter } from '../invoke-event';

const mockSelect = select as jest.Mock;
const mockSubscribe = subscribe as unknown as jest.Mock;
const mockRecordTracksEvent = recordTracksEvent as jest.Mock;

function setHelpCenterOpen( open: boolean ) {
	mockSelect.mockReturnValue( { isHelpCenterShown: () => open } );
}

describe( 'invokeSurvicateEvent', () => {
	beforeEach( () => {
		window._sva = undefined;
		setHelpCenterOpen( false );
	} );

	afterEach( () => {
		window._sva = undefined;
		mockSelect.mockReset();
		mockRecordTracksEvent.mockReset();
	} );

	test( 'should call invokeEvent immediately when SDK is ready', () => {
		const invokeEvent = jest.fn();
		window._sva = { invokeEvent };

		invokeSurvicateEvent( 'testEvent' );

		expect( invokeEvent ).toHaveBeenCalledWith( 'testEvent' );
	} );

	test( 'should return a cleanup function', () => {
		const cleanup = invokeSurvicateEvent( 'testEvent' );
		expect( typeof cleanup ).toBe( 'function' );
	} );

	test( 'should defer invocation until SurvicateReady when SDK is not ready', () => {
		const invokeEvent = jest.fn();

		invokeSurvicateEvent( 'testEvent' );
		expect( invokeEvent ).not.toHaveBeenCalled();

		window._sva = { invokeEvent };
		window.dispatchEvent( new Event( 'SurvicateReady' ) );
		expect( invokeEvent ).toHaveBeenCalledWith( 'testEvent' );
	} );

	test( 'should not invoke event when cleanup is called before SurvicateReady', () => {
		const invokeEvent = jest.fn();
		const cleanup = invokeSurvicateEvent( 'testEvent' );

		cleanup();

		window._sva = { invokeEvent };
		window.dispatchEvent( new Event( 'SurvicateReady' ) );
		expect( invokeEvent ).not.toHaveBeenCalled();
	} );

	test( 'should only invoke once even if SurvicateReady fires multiple times', () => {
		const invokeEvent = jest.fn();

		invokeSurvicateEvent( 'testEvent' );

		window._sva = { invokeEvent };
		window.dispatchEvent( new Event( 'SurvicateReady' ) );
		window.dispatchEvent( new Event( 'SurvicateReady' ) );
		expect( invokeEvent ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should suppress event and close survey when Help Center is open', () => {
		const invokeEvent = jest.fn();
		const closeSurvey = jest.fn();
		window._sva = { invokeEvent, closeSurvey };

		setHelpCenterOpen( true );
		invokeSurvicateEvent( 'testEvent' );

		expect( invokeEvent ).not.toHaveBeenCalled();
		expect( closeSurvey ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'should suppress deferred event when Help Center opens before SurvicateReady', () => {
		const invokeEvent = jest.fn();

		invokeSurvicateEvent( 'testEvent' );
		setHelpCenterOpen( true );

		window._sva = { invokeEvent };
		window.dispatchEvent( new Event( 'SurvicateReady' ) );
		expect( invokeEvent ).not.toHaveBeenCalled();
	} );

	test( 'should suppress the event and close the survey when a modal is open', () => {
		const invokeEvent = jest.fn();
		const closeSurvey = jest.fn();
		window._sva = { invokeEvent, closeSurvey };

		const modal = document.createElement( 'div' );
		modal.setAttribute( 'role', 'dialog' );
		modal.setAttribute( 'aria-modal', 'true' );
		( modal as HTMLElement & { checkVisibility?: () => boolean } ).checkVisibility = () => true;
		document.body.appendChild( modal );

		invokeSurvicateEvent( 'testEvent' );

		expect( invokeEvent ).not.toHaveBeenCalled();
		expect( closeSurvey ).toHaveBeenCalledTimes( 1 );
		expect( mockRecordTracksEvent ).toHaveBeenCalledWith( 'calypso_survicate_survey_suppressed', {
			reason: 'modal',
			trigger: 'invoke_event',
			event_name: 'testEvent',
		} );

		modal.remove();
	} );

	test( 'should suppress a deferred event when a modal is open at SurvicateReady time', () => {
		const invokeEvent = jest.fn();

		invokeSurvicateEvent( 'testEvent' );

		const modal = document.createElement( 'div' );
		modal.setAttribute( 'role', 'dialog' );
		modal.setAttribute( 'aria-modal', 'true' );
		( modal as HTMLElement & { checkVisibility?: () => boolean } ).checkVisibility = () => true;
		document.body.appendChild( modal );

		window._sva = { invokeEvent };
		window.dispatchEvent( new Event( 'SurvicateReady' ) );

		expect( invokeEvent ).not.toHaveBeenCalled();

		modal.remove();
	} );

	test( 'should fall back gracefully when Help Center store is unavailable', () => {
		const invokeEvent = jest.fn();
		window._sva = { invokeEvent };

		mockSelect.mockImplementation( () => {
			throw new Error( 'Store not registered' );
		} );
		invokeSurvicateEvent( 'testEvent' );
		expect( invokeEvent ).toHaveBeenCalledWith( 'testEvent' );
	} );
} );

describe( 'observeHelpCenter', () => {
	afterEach( () => {
		mockSelect.mockReset();
		mockSubscribe.mockClear();
	} );

	function setHelpCenterShown( open: boolean ) {
		mockSelect.mockReturnValue( { isHelpCenterShown: () => open } );
	}

	function notifyStore() {
		mockSubscribe.mock.calls.at( -1 )?.[ 0 ]?.();
	}

	test( 'should fire onOpen when the Help Center opens', () => {
		setHelpCenterShown( false );
		const onOpen = jest.fn();
		const onClose = jest.fn();
		observeHelpCenter( onOpen, onClose );

		setHelpCenterShown( true );
		notifyStore();

		expect( onOpen ).toHaveBeenCalledTimes( 1 );
		expect( onClose ).not.toHaveBeenCalled();
	} );

	test( 'should fire onClose when the Help Center closes', () => {
		setHelpCenterShown( true );
		const onOpen = jest.fn();
		const onClose = jest.fn();
		observeHelpCenter( onOpen, onClose );

		setHelpCenterShown( false );
		notifyStore();

		expect( onClose ).toHaveBeenCalledTimes( 1 );
		expect( onOpen ).not.toHaveBeenCalled();
	} );

	test( 'should not fire when the state has not changed', () => {
		setHelpCenterShown( false );
		const onOpen = jest.fn();
		const onClose = jest.fn();
		observeHelpCenter( onOpen, onClose );

		notifyStore();
		notifyStore();

		expect( onOpen ).not.toHaveBeenCalled();
		expect( onClose ).not.toHaveBeenCalled();
	} );

	test( 'should fire each transition only once until the state flips again', () => {
		setHelpCenterShown( false );
		const onOpen = jest.fn();
		observeHelpCenter( onOpen, jest.fn() );

		setHelpCenterShown( true );
		notifyStore();
		notifyStore();

		expect( onOpen ).toHaveBeenCalledTimes( 1 );
	} );
} );
