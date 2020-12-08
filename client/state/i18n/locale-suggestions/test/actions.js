/**
 * Internal dependencies
 */
import { receiveLocaleSuggestions, requestLocaleSuggestions } from '../actions';
import {
	I18N_LOCALE_SUGGESTIONS_REQUEST,
	I18N_LOCALE_SUGGESTIONS_ADD,
} from 'calypso/state/action-types';

describe( 'locale suggestions actions', () => {
	test( '#requestLocaleSuggestions()', () => {
		expect( requestLocaleSuggestions() ).toEqual( {
			type: I18N_LOCALE_SUGGESTIONS_REQUEST,
		} );
	} );

	test( '#receiveLocaleSuggestions()', () => {
		expect( receiveLocaleSuggestions( [ 1, 2, 3 ] ) ).toEqual( {
			type: I18N_LOCALE_SUGGESTIONS_ADD,
			items: [ 1, 2, 3 ],
		} );
	} );
} );
