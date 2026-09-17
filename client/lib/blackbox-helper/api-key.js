/**
 * Dev-only override for the Blackbox public test collect keys.
 * @see test/e2e/lib/blackbox-test-key.ts
 * @see blackbox.api/docs/test-keys.md
 */

const BLACKBOX_DEV_API_KEY_OVERRIDE_STORAGE_KEY = 'blackbox-dev-api-key-override';

const BLACKBOX_TEST_COLLECT_KEYS = {
	allow: '1xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
	block: '2xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
	challenge: '3xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
};

export const BLACKBOX_DEV_API_KEY_OVERRIDE_OPTIONS = [ 'default', 'allow', 'block', 'challenge' ];

export function getBlackboxDevApiKeyOverride() {
	if ( typeof window === 'undefined' || typeof window.sessionStorage === 'undefined' ) {
		return 'default';
	}

	try {
		const stored = window.sessionStorage.getItem( BLACKBOX_DEV_API_KEY_OVERRIDE_STORAGE_KEY );
		if ( stored && BLACKBOX_DEV_API_KEY_OVERRIDE_OPTIONS.includes( stored ) ) {
			return stored;
		}
	} catch {
		// Private browsing can block sessionStorage.
	}

	return 'default';
}

export function setBlackboxDevApiKeyOverride( override ) {
	if ( ! BLACKBOX_DEV_API_KEY_OVERRIDE_OPTIONS.includes( override ) ) {
		return;
	}

	try {
		if ( override === 'default' ) {
			window.sessionStorage.removeItem( BLACKBOX_DEV_API_KEY_OVERRIDE_STORAGE_KEY );
		} else {
			window.sessionStorage.setItem( BLACKBOX_DEV_API_KEY_OVERRIDE_STORAGE_KEY, override );
		}
	} catch {
		// Fall through — reload still applies when storage works on the next visit.
	}

	window.location.reload();
}

export function resolveBlackboxApiKey( configApiKey ) {
	if ( process.env.NODE_ENV !== 'development' ) {
		return configApiKey;
	}

	const override = getBlackboxDevApiKeyOverride();
	if ( override === 'default' ) {
		return configApiKey;
	}

	return BLACKBOX_TEST_COLLECT_KEYS[ override ] || configApiKey;
}
