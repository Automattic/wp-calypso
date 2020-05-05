// All end-to-end tests use a custom user agent containing this string.
const E2E_USER_AGENT = 'wp-e2e-tests';

export function isE2ETest(): boolean {
	return typeof navigator !== 'undefined' && navigator.userAgent.includes( E2E_USER_AGENT );
}
