import { useEffect } from 'react';
import { useSelector, useDispatch } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { requestSite } from 'calypso/state/sites/actions';
import { useSiteData } from './use-site-data';

export function useCanUserManageOptions() {
	const dispatch = useDispatch();
	const { site, siteSlugOrId } = useSiteData();
	const canManageOptions = useSelector( ( state ) =>
		canCurrentUser( state, site?.ID, 'manage_options' )
	);

	// Request the site for the redux store
	useEffect( () => {
		if ( siteSlugOrId ) {
			dispatch( requestSite( siteSlugOrId ) );
		}
	}, [ siteSlugOrId ] );

	return {
		canManageOptions,
		isLoading: siteSlugOrId && ! site,
	};
}
