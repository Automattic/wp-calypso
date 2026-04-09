/**
 * @jest-environment jsdom
 */
import { recordTracksEvent as calypsoRecordTracksEvent } from '@automattic/calypso-analytics';
import {
	recordTracksEvent,
	trackEvent,
	setTrackingHandler,
	setDefaultTracksEnabled,
	__resetTrackingForTests,
} from '../tracking';

jest.mock( '@automattic/calypso-analytics', () => ( { recordTracksEvent: jest.fn() } ), {
	virtual: true,
} );

const mockCalypsoRecordTracksEvent = calypsoRecordTracksEvent as jest.MockedFunction<
	typeof calypsoRecordTracksEvent
>;

describe( 'tracking', () => {
	beforeEach( () => {
		mockCalypsoRecordTracksEvent.mockReset();
		__resetTrackingForTests();
	} );

	describe( 'recordTracksEvent (default + handler path)', () => {
		it( 'fires through Calypso with the calypso_ prefix by default', () => {
			recordTracksEvent( 'agents_manager_link_click', {
				href: 'https://example.com',
			} );

			expect( mockCalypsoRecordTracksEvent ).toHaveBeenCalledTimes( 1 );
			expect( mockCalypsoRecordTracksEvent ).toHaveBeenCalledWith(
				'calypso_agents_manager_link_click',
				{ href: 'https://example.com' }
			);
		} );

		it( 'does not call any handler when none is registered', () => {
			recordTracksEvent( 'agents_manager_link_click' );
			// Only the Calypso path fired. Nothing else to assert — absence
			// of handler is implicit.
			expect( mockCalypsoRecordTracksEvent ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'also calls the registered handler with the unprefixed name', () => {
			const fn = jest.fn();
			setTrackingHandler( fn );

			recordTracksEvent( 'agents_manager_response_feedback_action', {
				feedback_type: 'up',
			} );

			expect( mockCalypsoRecordTracksEvent ).toHaveBeenCalledWith(
				'calypso_agents_manager_response_feedback_action',
				{ feedback_type: 'up' }
			);
			expect( fn ).toHaveBeenCalledWith( 'agents_manager_response_feedback_action', {
				feedback_type: 'up',
			} );
		} );

		it( 'skips the Calypso path when default tracks are disabled', () => {
			const fn = jest.fn();
			setTrackingHandler( fn );
			setDefaultTracksEnabled( false );

			recordTracksEvent( 'agents_manager_link_click', { href: '/a' } );

			expect( mockCalypsoRecordTracksEvent ).not.toHaveBeenCalled();
			expect( fn ).toHaveBeenCalledWith( 'agents_manager_link_click', {
				href: '/a',
			} );
		} );

		it( 'fires nothing when default is disabled and no handler is registered', () => {
			setDefaultTracksEnabled( false );

			recordTracksEvent( 'agents_manager_link_click' );

			expect( mockCalypsoRecordTracksEvent ).not.toHaveBeenCalled();
		} );

		it( 'restores default behavior when setDefaultTracksEnabled( true ) is called', () => {
			setDefaultTracksEnabled( false );
			recordTracksEvent( 'agents_manager_link_click' );
			expect( mockCalypsoRecordTracksEvent ).not.toHaveBeenCalled();

			setDefaultTracksEnabled( true );
			recordTracksEvent( 'agents_manager_link_click' );

			expect( mockCalypsoRecordTracksEvent ).toHaveBeenCalledTimes( 1 );
			expect( mockCalypsoRecordTracksEvent ).toHaveBeenCalledWith(
				'calypso_agents_manager_link_click',
				undefined
			);
		} );
	} );

	describe( 'trackEvent (handler-only path)', () => {
		it( 'does nothing when no handler is registered', () => {
			trackEvent( 'panel_view', { chat_state: 'sidebar' } );
			expect( mockCalypsoRecordTracksEvent ).not.toHaveBeenCalled();
		} );

		it( 'calls the registered handler with the event name and props', () => {
			const fn = jest.fn();
			setTrackingHandler( fn );

			trackEvent( 'panel_view', { chat_state: 'sidebar' } );

			expect( fn ).toHaveBeenCalledWith( 'panel_view', {
				chat_state: 'sidebar',
			} );
		} );

		it( 'never fires through the Calypso tracks pipeline', () => {
			const fn = jest.fn();
			setTrackingHandler( fn );

			trackEvent( 'panel_view' );

			expect( mockCalypsoRecordTracksEvent ).not.toHaveBeenCalled();
		} );

		it( 'is unaffected by the defaultTracksEnabled switch', () => {
			const fn = jest.fn();
			setTrackingHandler( fn );
			setDefaultTracksEnabled( false );

			trackEvent( 'panel_view' );
			expect( fn ).toHaveBeenCalledWith( 'panel_view', undefined );

			setDefaultTracksEnabled( true );
			trackEvent( 'panel_close' );
			expect( fn ).toHaveBeenCalledWith( 'panel_close', undefined );

			// trackEvent should never hit the Calypso pipeline regardless.
			expect( mockCalypsoRecordTracksEvent ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'setTrackingHandler', () => {
		it( 'replaces an existing handler', () => {
			const first = jest.fn();
			const second = jest.fn();

			setTrackingHandler( first );
			setTrackingHandler( second );

			trackEvent( 'panel_view' );

			expect( first ).not.toHaveBeenCalled();
			expect( second ).toHaveBeenCalledWith( 'panel_view', undefined );
		} );

		it( 'clears the handler when passed undefined', () => {
			const fn = jest.fn();
			setTrackingHandler( fn );
			setTrackingHandler( undefined );

			trackEvent( 'panel_view' );

			expect( fn ).not.toHaveBeenCalled();
		} );
	} );
} );
