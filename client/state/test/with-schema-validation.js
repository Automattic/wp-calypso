/**
 * Internal dependencies
 */
import {
	withSchemaValidation,
} from 'state/utils';

describe( 'json-schema', () => {
	test( 'should warn when called with invalid schema', () => {
		const consoleWarnSpy = jest.spyOn( global.console, 'warn' );
		const age = ( state = 0, action ) => ( 'GROW' === action.type ? state + 1 : state );

		withSchemaValidation( 12, age );
		expect( consoleWarnSpy ).toHaveBeenCalledTimes( 1 );

		withSchemaValidation( { anyOf: [ { type: 'string' }, false ] }, age );
		expect( consoleWarnSpy ).toHaveBeenCalledTimes( 2 );
	} );
} );
