import config from '@automattic/calypso-config';
import { WPCOM_FEATURES_UPWORK_SUPPORT_EXEMPT } from '@automattic/calypso-products';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import type { AppState } from 'calypso/types';

/**
 * @param state Global state tree
 * @returns Whether or not this customer should receive Upwork support
 */
export default function isEligibleForUpworkSupport( state: AppState ): boolean {
	if (
		! config< string[] >( 'upwork_support_locales' ).includes( getCurrentUserLocale( state ) )
	) {
		return false;
	}

	return ! Object.values( getSitesItems( state ) ).some( ( { ID } ) =>
		siteHasFeature( state, ID ?? 0, WPCOM_FEATURES_UPWORK_SUPPORT_EXEMPT )
	);
}
