/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isSiteDescriptionBlacklisted } from '../';

describe( 'isSiteDescriptionBlacklisted', () => {
	it( 'should return true if a site description is blacklisted', function() {
		const blackListedDescription = 'Just another WordPress site';
		expect( isSiteDescriptionBlacklisted( blackListedDescription ) ).to.equal( true );
	} );

	it( 'should return false if a site description is not blacklisted', function() {
		const unBlackListedDescription = 'My site is marvellous';
		expect( isSiteDescriptionBlacklisted( unBlackListedDescription ) ).to.equal( false );
	} );
} );
