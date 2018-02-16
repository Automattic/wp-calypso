// All end-to-end tests use a custom user agent containing this string.
export const E2E_USER_AGENT = 'wp-e2e-tests';

export function isE2ETest() {
	return new RegExp( E2E_USER_AGENT ).test( navigator.userAgent );
}
