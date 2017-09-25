/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import cssSafeUrl from '../';

describe( 'css-safe-url', () => {
	it( 'should escape parens', () => {
		expect( cssSafeUrl( 'http://foo.com/()/' ) ).to.equal( 'http://foo.com/\\(\\)/' );
	} );
} );
