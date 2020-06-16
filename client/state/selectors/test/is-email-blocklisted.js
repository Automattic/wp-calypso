/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isEmailBlocklisted from 'state/selectors/is-email-blocklisted';

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

describe( 'isEmailBlocklisted()', () => {
	test( 'should return true if email is blocklisted', () => {
		expect( isEmailBlocklisted( state, 123, email ) ).to.be.true;
	} );
	test( 'should return false if email is not blocklisted', () => {
		expect( isEmailBlocklisted( state, 456, email ) ).to.be.false;
	} );
	test( 'should return false if blocklist is empty', () => {
		expect( isEmailBlocklisted( state, 789, email ) ).to.be.false;
	} );
	test( 'should return false if there are no site settings in state', () => {
		expect( isEmailBlocklisted( noSiteSettingsState, 123, email ) ).to.be.false;
	} );
	test( 'should return false if no email is provided', () => {
		expect( isEmailBlocklisted( state, 123 ) ).to.be.false;
	} );
	test( 'should return false if email is empty', () => {
		expect( isEmailBlocklisted( state, 123, '' ) ).to.be.false;
	} );
} );
