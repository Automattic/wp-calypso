import getRawSite from 'calypso/state/selectors/get-raw-site';
import type { SiteDetailsOptions } from '@automattic/data-stores';
import type { AppState } from 'calypso/types';

const EMPTY_OPTIONS = Object.freeze( {} );

/**
 * Returns the site options
 */
export default ( state: AppState, siteId: number ): SiteDetailsOptions | null => {
	const site = getRawSite( state, siteId );
	if ( ! site ) {
		return null;
	}
	return site.options || EMPTY_OPTIONS;
};
