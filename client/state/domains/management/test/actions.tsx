/**
 * @jest-environment jsdom
 */
import { showUpdatePrimaryDomainErrorNotice } from '../actions';

const ATOMIC_DOMAIN_IN_USE_COPY =
	'This domain is already in use on another WordPress.com or WP Cloud site. Remove it from the originating site, or contact support to set up TXT record verification.';

const dispatchAndCaptureNotice = ( errorMessage: string ) => {
	const dispatch = jest.fn();
	showUpdatePrimaryDomainErrorNotice( errorMessage )( dispatch );
	expect( dispatch ).toHaveBeenCalledTimes( 1 );
	return dispatch.mock.calls[ 0 ][ 0 ].notice;
};

describe( 'showUpdatePrimaryDomainErrorNotice', () => {
	test( 'shows actionable copy when message matches Atomic "domain already used" error', () => {
		const notice = dispatchAndCaptureNotice(
			'Domain already used on a different site [example.com]. TXT record verification is required to bypass this check.'
		);

		expect( notice.status ).toBe( 'is-error' );
		expect( notice.text ).toBe( ATOMIC_DOMAIN_IN_USE_COPY );
		expect( notice.href ).toBe( 'https://wordpress.com/help/contact' );
	} );

	test( 'shows actionable copy when message matches Atomic "setting domain-as-primary failed" error', () => {
		const notice = dispatchAndCaptureNotice(
			'Setting domain-as-primary failed: Domain name already used [example.com]. TXT record verification is required to bypass this check.'
		);

		expect( notice.status ).toBe( 'is-error' );
		expect( notice.text ).toBe( ATOMIC_DOMAIN_IN_USE_COPY );
		expect( notice.href ).toBe( 'https://wordpress.com/help/contact' );
	} );

	test( 'falls through to passthrough copy for unrelated error messages', () => {
		const notice = dispatchAndCaptureNotice( 'Something else broke' );

		expect( notice.status ).toBe( 'is-error' );
		expect( notice.text ).toBe( 'Something else broke' );
		expect( notice.href ).toBeUndefined();
	} );

	test( 'falls through to default copy when error message is empty', () => {
		const notice = dispatchAndCaptureNotice( '' );

		expect( notice.status ).toBe( 'is-error' );
		expect( notice.text ).toBe(
			"Something went wrong and we couldn't change your primary domain."
		);
		expect( notice.href ).toBeUndefined();
	} );
} );
