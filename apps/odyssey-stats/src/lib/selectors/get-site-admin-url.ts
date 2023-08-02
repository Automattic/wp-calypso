import getSiteAdminUrlFromState from 'calypso/state/sites/selectors/get-site-admin-url';
import getState from './get-state';

const getSiteAdminUrl = ( siteId: number ): null | string =>
	getSiteAdminUrlFromState( getState(), siteId );

export default getSiteAdminUrl;
