import getSiteOptions from './get-site-options';
import type { SiteDetailsOptions } from '@automattic/data-stores';
import type { AppState } from 'calypso/types';

/**
 * Returns a site option for a site
 */
export default function getSiteOption< T extends keyof SiteDetailsOptions >(
	state: AppState,
	siteId: number | undefined | null,
	optionName: T
): SiteDetailsOptions[ T ] | null {
	if ( ! siteId ) {
		return null;
	}
	const options = getSiteOptions( state, siteId );
	return options?.[ optionName ] ?? null;
}
