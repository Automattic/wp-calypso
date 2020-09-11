/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { editorDeprecationGroupReducer } from '../reducer';
import { EDITOR_DEPRECATION_GROUP_SET } from 'state/action-types';

describe( "editorDeprecationGroupReducer's", () => {
	test( 'should default to null', () => {
		const state = editorDeprecationGroupReducer( undefined, {} );

		expect( state ).to.eql( '' );
	} );

	test( 'should return editor deprecation group received', () => {
		const state = editorDeprecationGroupReducer( null, {
			type: EDITOR_DEPRECATION_GROUP_SET,
			inEditorDeprecationGroup: 'test',
		} );

		expect( state ).to.eql( 'test' );
	} );
} );
