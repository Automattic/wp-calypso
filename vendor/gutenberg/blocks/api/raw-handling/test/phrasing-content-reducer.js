/**
 * External dependencies
 */
import { equal } from 'assert';

/**
 * Internal dependencies
 */
import phrasingContentReducer from '../phrasing-content-reducer';
import { deepFilterHTML } from '../utils';

describe( 'phrasingContentReducer', () => {
	it( 'should transform font weight', () => {
		equal( deepFilterHTML( '<span style="font-weight:bold">test</span>', [ phrasingContentReducer ], {} ), '<strong>test</strong>' );
	} );

	it( 'should transform numeric font weight', () => {
		equal( deepFilterHTML( '<span style="font-weight:700">test</span>', [ phrasingContentReducer ], {} ), '<strong>test</strong>' );
	} );

	it( 'should transform font style', () => {
		equal( deepFilterHTML( '<span style="font-style:italic">test</span>', [ phrasingContentReducer ], {} ), '<em>test</em>' );
	} );

	it( 'should remove invalid phrasing content', () => {
		equal( deepFilterHTML( '<strong><p>test</p></strong>', [ phrasingContentReducer ], { p: {} } ), '<p>test</p>' );
	} );
} );
