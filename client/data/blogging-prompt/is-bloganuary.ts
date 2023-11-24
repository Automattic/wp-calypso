import { isEnabled } from '@automattic/calypso-config';

/**
 * In future this will be automatically enabled in January. For now it just checks a feature flag.
 * @returns true if bloganuary mode is active
 */
export default function isBloganuary() {
	return isEnabled( 'bloganuary' );
}
