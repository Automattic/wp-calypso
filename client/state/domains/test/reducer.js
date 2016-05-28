/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';

describe( 'reducer', () => {
	it( 'should export expected reducer keys', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'suggestions'
		] );
	} );
} );
