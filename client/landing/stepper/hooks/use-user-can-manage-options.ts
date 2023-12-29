import { useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { useSiteData } from './use-site-data';

export function useCanUserManageOptions() {
	const { site, siteSlugOrId } = useSiteData();
	const canManageOptions = useSelector( ( state ) =>
		canCurrentUser( state, site?.ID, 'manage_options' )
	);

	return {
		canManageOptions,
		isLoading: siteSlugOrId && ! site,
	};
}
