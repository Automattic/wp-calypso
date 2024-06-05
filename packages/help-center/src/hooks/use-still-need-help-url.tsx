/* eslint-disable no-restricted-imports */

import { useSupportAvailability } from '../data/use-support-availability';
import { useIsWapuuEnabled } from './use-is-wapuu-enabled';
import useUserIsAtomicAdmin from './use-user-is-admin-atomic';

/**
 * This function is used as a fallback for users navigating through wp-admin.
 * It checks if the 'flags' URL parameter is set to 'wapuu' when useIsWapuuEnabled() fails to do so.
 * @returns boolean
 */
export function isWapuuFlagSetInURL(): boolean {
	const currentUrl = window.location.href;
	const urlParams = new URLSearchParams( new URL( currentUrl ).search );
	return urlParams.get( 'flags' ) === 'wapuu';
}

export function useStillNeedHelpURL() {
	const { data: supportAvailability, isLoading } = useSupportAvailability();
	const isWapuuEnabled = useIsWapuuEnabled() || isWapuuFlagSetInURL();
	const isFreeUser = ! supportAvailability?.is_paying_customer;
	const { isAtomicSite, isAdministrator } = useUserIsAtomicAdmin();

	// Atomic site administrators are eligible for chat.
	if ( ( isAtomicSite && isAdministrator ) || ! isFreeUser ) {
		const url = isWapuuEnabled ? '/odie' : '/contact-options';
		return { url, isLoading: false };
	}

	return { url: '/contact-form?mode=FORUM', isLoading };
}
