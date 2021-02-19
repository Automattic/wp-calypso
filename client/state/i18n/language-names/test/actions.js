/**
 * Internal dependencies
 */
import { receiveLanguageNames, requestLanguageNames } from '../actions';
import { I18N_LANGUAGE_NAMES_REQUEST, I18N_LANGUAGE_NAMES_ADD } from 'calypso/state/action-types';

describe( 'language names actions', () => {
	test( '#requestLanguageNames()', () => {
		expect( requestLanguageNames() ).toEqual( {
			type: I18N_LANGUAGE_NAMES_REQUEST,
		} );
	} );

	test( '#receiveLanguageNames()', () => {
		const action = receiveLanguageNames( { bob: 'down' } );
		expect( action ).toEqual( {
			type: I18N_LANGUAGE_NAMES_ADD,
			items: { bob: 'down' },
		} );
	} );
} );
