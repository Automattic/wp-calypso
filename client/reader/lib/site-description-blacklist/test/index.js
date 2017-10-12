/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isSiteDescriptionBlacklisted } from '../';

describe( 'isSiteDescriptionBlacklisted', () => {
	test( 'should return true if a site description is blacklisted', () => {
		const blackListedDescription = 'Just another WordPress site';
		expect( isSiteDescriptionBlacklisted( blackListedDescription ) ).to.be.true;
	} );

	test( 'should return false if a site description is not blacklisted', () => {
		const unBlackListedDescription = 'My site is marvellous';
		expect( isSiteDescriptionBlacklisted( unBlackListedDescription ) ).to.be.false;
	} );
} );
