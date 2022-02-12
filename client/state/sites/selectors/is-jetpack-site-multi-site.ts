import getRawSite from 'calypso/state/selectors/get-raw-site';
import { IAppState } from 'calypso/state/types';
import isJetpackSite from './is-jetpack-site';

export default function isJetpackSiteMultiSite( state: IAppState, siteId: number | null ) {
	const site = getRawSite( state, siteId );

	if ( ! site || ! isJetpackSite( state, siteId ) ) {
		return null;
	}

	return site.is_multisite === true;
}
