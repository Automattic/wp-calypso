import getSiteSlug from 'calypso/state/sites/selectors/get-site-slug';
import { IAppState } from 'calypso/state/types';
import getSelectedSiteId from './get-selected-site-id';

export default function getSelectedSiteSlug( state: IAppState ) {
	const siteId = getSelectedSiteId( state );
	if ( ! siteId ) {
		return null;
	}

	return getSiteSlug( state, siteId );
}
