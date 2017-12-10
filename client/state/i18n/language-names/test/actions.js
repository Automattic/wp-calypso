/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { receiveLanguageNames, requestLanguageNamesFailed, requestLanguageNames } from '../actions';
import {
	I18N_LANGUAGE_NAMES_REQUEST,
	I18N_LANGUAGE_NAMES_REQUEST_SUCCESS,
	I18N_LANGUAGE_NAMES_REQUEST_FAILURE,
} from 'state/action-types';

describe( 'language names actions', () => {
	test( '#requestLanguageNames()', () => {
		expect( requestLanguageNames() ).to.eql( {
			type: I18N_LANGUAGE_NAMES_REQUEST,
		} );
	} );

	test( '#requestLanguageNamesFailed()', () => {
		const action = requestLanguageNamesFailed( 'Error! Alert!' );
		expect( action ).to.eql( {
			type: I18N_LANGUAGE_NAMES_REQUEST_FAILURE,
			error: 'Error! Alert!',
		} );
	} );

	test( '#receiveLanguageNames()', () => {
		const action = receiveLanguageNames( { bob: 'down' } );
		expect( action ).to.eql( {
			type: I18N_LANGUAGE_NAMES_REQUEST_SUCCESS,
			items: { bob: 'down' },
		} );
	} );
} );
