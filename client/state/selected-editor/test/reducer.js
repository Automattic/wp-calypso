/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { EDITOR_TYPE_SET } from 'calypso/state/action-types';
import selectedEditor from '../reducer';

describe( 'reducer', () => {
	test( 'should add a new given site ID key and its value', () => {
		const state = selectedEditor( deepFreeze( {} ), {
			type: EDITOR_TYPE_SET,
			siteId: 2916284,
			editor: 'gutenberg',
		} );

		expect( state ).toEqual( {
			2916284: 'gutenberg',
		} );
	} );

	test( 'should update an existing given site ID key', () => {
		const original = deepFreeze( {
			2916284: 'classic',
		} );
		const state = selectedEditor( original, {
			type: EDITOR_TYPE_SET,
			siteId: 2916284,
			editor: 'gutenberg',
		} );

		expect( state ).toEqual( {
			2916284: 'gutenberg',
		} );
	} );
} );
