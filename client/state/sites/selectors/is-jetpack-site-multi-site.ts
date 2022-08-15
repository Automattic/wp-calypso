import getRawSite from 'calypso/state/selectors/get-raw-site';
import { IAppState } from 'calypso/state/types';
import isJetpackSite from './is-jetpack-site';

/**
 * Determines if the Jetpack site is part of multi-site.
 * Returns null if the site is not known or is not a Jetpack site.
 *
 * @param  {object}   state  Global state tree
 * @param  {number}   siteId Site ID
 * @returns {?boolean}        true if the site is multi-site
 */
export default function isJetpackSiteMultiSite( state: IAppState, siteId: number | null ) {
	const site = getRawSite( state, siteId );

	if ( ! site || ! isJetpackSite( state, siteId ) ) {
		return null;
	}

	return site.is_multisite === true;
}
