/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import isEmailDisallowed from 'state/selectors/is-email-disallowed';

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

describe( 'isEmailDisallowed()', () => {
	test( 'should return true if email is blocklisted', () => {
		expect( isEmailDisallowed( state, 123, email ) ).to.be.true;
	} );
	test( 'should return false if email is not blocklisted', () => {
		expect( isEmailDisallowed( state, 456, email ) ).to.be.false;
	} );
	test( 'should return false if blocklist is empty', () => {
		expect( isEmailDisallowed( state, 789, email ) ).to.be.false;
	} );
	test( 'should return false if there are no site settings in state', () => {
		expect( isEmailDisallowed( noSiteSettingsState, 123, email ) ).to.be.false;
	} );
	test( 'should return false if no email is provided', () => {
		expect( isEmailDisallowed( state, 123 ) ).to.be.false;
	} );
	test( 'should return false if email is empty', () => {
		expect( isEmailDisallowed( state, 123, '' ) ).to.be.false;
	} );
} );
