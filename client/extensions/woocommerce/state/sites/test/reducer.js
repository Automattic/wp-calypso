/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';

// TODO: These tests will no longer be needed after this reducer is moved under state/site
describe( 'reducer', () => {
	test( 'should initialize to an empty object', () => {
		expect( reducer( undefined, { type: '@@UNKNOWN_ACTION' } ) ).to.eql( {} );
	} );
} );
