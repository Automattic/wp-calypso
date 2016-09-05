/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import * as userAgentUtils from '../';

describe( '#isChromeOS', ( ) => {

	it( 'should return true if the user agent matches CrOS', ( ) => {
		expect( userAgentUtils.isChromeOS( 'CrOS' ) ).to.be.true;
	} );

	it( 'should return false if the user agent doesn\'t match CrOS', ( ) => {
		expect( userAgentUtils.isChromeOS( 'Rando' ) ).to.be.false;
	} );
} );
