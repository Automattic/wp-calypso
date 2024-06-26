import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { getSiteSlug, getSiteAdminUrl } from 'calypso/state/sites/selectors';
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
	if ( isJetpackCloud() || isA8CForAgencies() ) {
		if ( section === 'general' ) {
			return `${ siteAdminUrl }options-general.php`;
		}
	} else if ( section === 'general' ) {
		return `/settings/general/${ siteSlug }`;
	}

	return null;
}

export default getSettingsUrl;
