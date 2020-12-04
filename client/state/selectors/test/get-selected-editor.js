/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { getSelectedEditor } from 'calypso/state/selectors/get-selected-editor';

describe( 'getSelectedEditor()', () => {
	test( 'should return null if site is not found', () => {
		expect( getSelectedEditor( deepFreeze( {} ), 123 ) ).toBeNull;
	} );

	test( 'should return editor value for a valid site with an editor set', () => {
		const state = deepFreeze( {
			selectedEditor: {
				123: 'gutenberg-iframe',
			},
			sites: {
				items: {
					123: {
						jetpack: false,
					},
				},
			},
		} );
		expect( getSelectedEditor( state, 123 ) ).toEqual( 'gutenberg-iframe' );
	} );
} );
