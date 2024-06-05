/* eslint-disable no-restricted-imports */

import { HelpCenterSelect } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import useUsersQuery from 'calypso/data/users/use-users-query';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { HELP_CENTER_STORE } from '../stores';

export default function useUserIsAtomicAdmin() {
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

	return {
		isAtomicSite,
		isAdministrator,
	};
}
