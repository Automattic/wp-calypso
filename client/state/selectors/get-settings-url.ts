/**
 * Internal dependencies
 */
import { getSiteSlug, getSiteAdminUrl } from 'calypso/state/sites/selectors';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

/**
 * Type dependencies
 */
import type { AppState } from 'calypso/types';

type Sections = 'general';

function getSettingsUrl(
	state: AppState,
	siteId: number | null,
	section: Sections
): string | null {
	if ( ! siteId ) {
		return null;
	}
	const siteSlug = getSiteSlug( state, siteId );
	const siteAdminUrl = getSiteAdminUrl( state, siteId );
	if ( isJetpackCloud() ) {
		if ( section === 'general' ) {
			return `${ siteAdminUrl }options-general.php`;
		}
	} else if ( section === 'general' ) {
		return `/settings/general/${ siteSlug }`;
	}

	return null;
}

export default getSettingsUrl;
