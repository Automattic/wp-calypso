import isAuthorsEmailBlocked from 'calypso/state/selectors/is-authors-email-blocked';

const email = 'foo@bar.baz';

const state = {
	siteSettings: {
		items: {
			123: {
				disallowed_keys: 'mail@mail.com\ntest@example.com\nfoo@bar.baz\nyadda@yadda.yadda',
			},
			456: {
				disallowed_keys: 'mail@mail.com\ntest@example.com\nyadda@yadda.yadda',
			},
			789: {
				disallowed_keys: '',
			},
		},
	},
};

const noSiteSettingsState = { siteSettings: { items: {} } };

describe( 'isAuthorsEmailBlocked()', () => {
	test( 'should return true if email is blocked', () => {
		expect( isAuthorsEmailBlocked( state, 123, email ) ).toBe( true );
	} );
	test( 'should return false if email is not blocked', () => {
		expect( isAuthorsEmailBlocked( state, 456, email ) ).toBe( false );
	} );
	test( 'should return false if blocklist is empty', () => {
		expect( isAuthorsEmailBlocked( state, 789, email ) ).toBe( false );
	} );
	test( 'should return false if there are no site settings in state', () => {
		expect( isAuthorsEmailBlocked( noSiteSettingsState, 123, email ) ).toBe( false );
	} );
	test( 'should return false if no email is provided', () => {
		expect( isAuthorsEmailBlocked( state, 123 ) ).toBe( false );
	} );
	test( 'should return false if email is empty', () => {
		expect( isAuthorsEmailBlocked( state, 123, '' ) ).toBe( false );
	} );
} );
