/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';

describe( 'state/signup/reducer', () => {
	test( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'dependencyStore',
			'flow',
			'optionalDependencies',
			'progress',
			'sitePreview',
			'steps',
			'verticals',
		] );
	} );
} );
