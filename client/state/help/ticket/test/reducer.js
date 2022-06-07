import {
	HELP_TICKET_CONFIGURATION_REQUEST,
	HELP_TICKET_CONFIGURATION_REQUEST_SUCCESS,
	HELP_TICKET_CONFIGURATION_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import reducer from '../reducer';
import { dummyConfiguration, dummyError } from './test-data';

describe( 'ticket-support/configuration reducer', () => {
	test( 'should default to the expected structure', () => {
		const defaultState = reducer( undefined, {} );

		expect( defaultState ).toEqual( {
			isReady: false,
			isRequesting: false,
			isUserEligible: false,
			requestError: null,
		} );
	} );

	test( 'should set isRequesting to true', () => {
		const state = reducer( undefined, {
			type: HELP_TICKET_CONFIGURATION_REQUEST,
		} );

		expect( state.isRequesting ).toBe( true );
	} );

	test( 'should set isUserEligible as is and isReady to true', () => {
		const state = reducer( undefined, {
			type: HELP_TICKET_CONFIGURATION_REQUEST_SUCCESS,
			configuration: dummyConfiguration,
		} );

		expect( state.isReady ).toBe( true );
		expect( state.isUserEligible ).toEqual( dummyConfiguration.is_user_eligible );
		expect( state.isRequesting ).toBe( false );
	} );

	test( 'should leave isReady as it is and requestError as the error on failed requests', () => {
		const state = reducer(
			{ isReady: false },
			{
				type: HELP_TICKET_CONFIGURATION_REQUEST_FAILURE,
				error: dummyError,
			}
		);

		expect( state.isReady ).toBe( false );
		expect( state.isRequesting ).toBe( false );
		expect( state.requestError ).toEqual( dummyError );
	} );

	const requestErrorState = { requestError: dummyError };

	test( 'should set requestError as false on receiving the new request', () => {
		const state = reducer( requestErrorState, {
			type: HELP_TICKET_CONFIGURATION_REQUEST,
		} );

		expect( state.requestError ).toBeNull();
	} );

	test( 'should set requestError as false on receiving the successful action', () => {
		const state = reducer( requestErrorState, {
			type: HELP_TICKET_CONFIGURATION_REQUEST_SUCCESS,
			configuration: dummyConfiguration,
		} );

		expect( state.requestError ).toBeNull();
	} );
} );
