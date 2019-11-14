/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isEmailBlacklisted from 'state/selectors/is-email-blacklisted';

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

const noSiteSettingsState = { siteSettings: {} };

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
	test( 'should return false if there are no site settings in state', () => {
		expect( isEmailBlacklisted( noSiteSettingsState, 123, email ) ).to.be.false;
	} );
	test( 'should return false if no email is provided', () => {
		expect( isEmailBlacklisted( state, 123 ) ).to.be.false;
	} );
	test( 'should return false if email is empty', () => {
		expect( isEmailBlacklisted( state, 123, '' ) ).to.be.false;
	} );
} );
