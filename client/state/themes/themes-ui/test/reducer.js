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
	test( 'should default to a backPath of /themes', () => {
		expect( reducer( undefined, {} ) ).to.eql( { backPath: '/themes' } );
	} );
} );
