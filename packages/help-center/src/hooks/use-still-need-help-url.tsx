/* eslint-disable no-restricted-imports */

import { HelpCenterSelect } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import useUsersQuery from 'calypso/data/users/use-users-query';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { useSupportAvailability } from '../data/use-support-availability';
import { HELP_CENTER_STORE } from '../stores';
import { useIsWapuuEnabled } from './use-is-wapuu-enabled';

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
	const currentSite = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return helpCenterSelect.getSite();
	}, [] );
	const isAtomicSite = currentSite?.is_wpcom_atomic;
	const currentUser = useSelector( getCurrentUser );
	const { data: userData } = useUsersQuery( currentSite?.ID, {
		search: currentUser?.email,
		search_columns: [ 'user_email' ],
	} );
	const isAdministrator = userData?.users?.[ 0 ]?.roles?.includes( 'administrator' );

	if ( ( isAtomicSite && isAdministrator ) || ! isFreeUser ) {
		const url = isWapuuEnabled ? '/odie' : '/contact-options';
		return { url, isLoading: false };
	}

	return { url: '/contact-form?mode=FORUM', isLoading };
}
