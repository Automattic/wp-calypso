/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { DESERIALIZE, SERIALIZE } from 'calypso/state/action-types';
import { createReduxStore } from 'calypso/state';
import reducer from 'calypso/state/reducer';

// Gets rid of warnings such as 'UnhandledPromiseRejectionWarning: Error: No available storage method found.'
jest.mock( 'calypso/lib/user', () => () => {} );

describe( 'persistence', () => {
	test( 'initial state should serialize and deserialize without errors or warnings', () => {
		const consoleErrorSpy = jest.spyOn( global.console, 'error' ).mockImplementation( noop );
		const consoleWarnSpy = jest.spyOn( global.console, 'warn' ).mockImplementation( noop );

		const initialState = createReduxStore().getState();
		reducer( reducer( initialState, { type: SERIALIZE } ).root(), { type: DESERIALIZE } );

		expect( consoleErrorSpy ).not.toHaveBeenCalled();
		expect( consoleWarnSpy ).not.toHaveBeenCalled();
	} );
} );
