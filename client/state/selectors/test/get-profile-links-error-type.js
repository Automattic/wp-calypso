/**
 * Internal dependencies
 */
import getProfileLinksErrorType from 'calypso/state/selectors/get-profile-links-error-type';

describe( 'getProfileLinksErrorType()', () => {
	const profileLinks = [
		{
			link_slug: 'wordpress-org',
			title: 'WordPress.org',
			value: 'https://wordpress.org/',
		},
	];

	test( 'should return null if there are no errors from the last profile links request', () => {
		const state = {
			userProfileLinks: {
				errors: {},
			},
		};

		expect( getProfileLinksErrorType( state ) ).toEqual( null );
	} );

	test( 'should return "duplicate" if there are duplicates in the last profile links request', () => {
		const state = {
			userProfileLinks: {
				errors: {
					duplicate: profileLinks,
				},
			},
		};

		expect( getProfileLinksErrorType( state ) ).toEqual( 'duplicate' );
	} );

	test( 'should return "malformed" if there are malformed links in the last profile links request', () => {
		const state = {
			userProfileLinks: {
				errors: {
					malformed: profileLinks,
				},
			},
		};

		expect( getProfileLinksErrorType( state ) ).toEqual( 'malformed' );
	} );

	test( 'should return "other" if there is another error in the last profile links request', () => {
		const state = {
			userProfileLinks: {
				errors: {
					error: {
						status: 403,
						message:
							'An active access token must be used to query information about the current user.',
					},
				},
			},
		};

		expect( getProfileLinksErrorType( state ) ).toEqual( 'other' );
	} );
} );
