import { useSelect } from '@wordpress/data';
import { useSelector } from 'react-redux';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isRequestingSites from 'calypso/state/sites/selectors/is-requesting-sites';
import { SITE_STORE } from '../stores';
import { useSiteSlugParam } from './use-site-slug-param';

export function useCanUserManageOptions() {
	const siteSlug = useSiteSlugParam();
	const siteId = useSelect(
		( select ) => siteSlug && select( SITE_STORE ).getSiteIdBySlug( siteSlug )
	);

	const isRequesting = useSelector( ( state ) => isRequestingSites( state ) );
	const hasManageOptionsCap = useSelector( ( state ) =>
		canCurrentUser( state, siteId as number, 'manage_options' )
	);

	return isRequesting ? 'requesting' : hasManageOptionsCap ?? false;
}
