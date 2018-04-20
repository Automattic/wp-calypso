/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';

describe( 'reducer', () => {
	const state = reducer( undefined, {} );

	test( 'should default to a backPath of /themes', () => {
		expect( state.backPath ).to.eql( '/themes' );
	} );

	test( 'should default to a themesBannerVisible of true', () => {
		expect( state.themesBannerVisible ).to.eql( true );
	} );
} );
