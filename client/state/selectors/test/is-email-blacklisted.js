/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isEmailBlacklisted } from '../';

const email = 'foo@bar.baz';

const state = {
	siteSettings: {
		items: {
			123: {
				blacklist_keys: 'mail@mail.com\ntest@example.com\nfoo@bar.baz\nyadda@yadda.yadda',
			},
			456: {
				blacklist_keys: 'mail@mail.com\ntest@example.com\nyadda@yadda.yadda',
			},
			789: {
				blacklist_keys: '',
			},
		},
	},
};

describe( 'isEmailBlacklisted()', () => {
	test( 'should return true if email is blacklisted', () => {
		expect( isEmailBlacklisted( state, 123, email ) ).to.be.true;
	} );
	test( 'should return false if email is not blacklisted', () => {
		expect( isEmailBlacklisted( state, 456, email ) ).to.be.false;
	} );
	test( 'should return false if blacklist is empty', () => {
		expect( isEmailBlacklisted( state, 789, email ) ).to.be.false;
	} );
} );
