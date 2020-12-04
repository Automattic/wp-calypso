/**
 * Internal dependencies
 */
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import getSite from './get-site';

/**
 * Returns true if the current user should be able to use the customer home screen
 *
 * @param  {object}   state  Global state tree
 * @param  {?number}  siteId Site ID
 * @returns {?boolean}        Whether the site can use the customer home screen
 */
export default function canCurrentUserUseCustomerHome( state, siteId = null ) {
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}

	if ( isVipSite( state, siteId ) ) {
		return false;
	}

	if ( isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId ) ) {
		return false;
	}

	const site = getSite( state, siteId );
	return site && canCurrentUser( state, siteId, 'manage_options' );
}
