/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isSiteDescriptionBlacklisted } from '../';

describe( 'isSiteDescriptionBlacklisted', () => {
	it( 'should return null if a site description is blacklisted', function() {
		const blackListedDescription = 'Just another WordPress site';
		const unBlackListedDescription = 'My site is marvellous';
		expect( isSiteDescriptionBlacklisted( blackListedDescription ) ).to.equal( true );
		expect( isSiteDescriptionBlacklisted( unBlackListedDescription ) ).to.equal( false );
	} );
} );
