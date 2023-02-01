import { WPCOM_FEATURES_WORDADS } from '@automattic/calypso-products';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import getSiteOption from './get-site-option';

/**
 * Returns true if current user can see and use WordAds option in menu
 *
 * @param  {Object}   state  Global state tree
 * @param  {number}   siteId Site ID
 * @returns {?boolean}        Whether site is previewable
 */
export default function canAccessWordAds( state, siteId = 0 ) {
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}

	const hasWordAdsFeature = siteHasFeature( state, siteId, WPCOM_FEATURES_WORDADS );

	if ( hasWordAdsFeature && canCurrentUser( state, siteId, 'activate_wordads' ) ) {
		return true;
	}

	return (
		( getSiteOption( state, siteId, 'wordads' ) || hasWordAdsFeature ) &&
		canCurrentUser( state, siteId, 'manage_options' )
	);
}
