import { useSelect } from '@wordpress/data';
import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { useSite } from './use-site';

export function useCanUserManageOptions() {
	const site = useSite();
	const canManageOptions = useSelect(
		( state ) => ( site ? canCurrentUser( state, site?.ID, 'manage_options' ) : null ),
		[ site?.ID ]
	);
	console.log( { site } );

	return {
		canManageOptions,
		isLoading: ! site,
	};
}
