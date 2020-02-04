/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import canCurrentUser from 'state/selectors/can-current-user';
import getSiteOptions from 'state/selectors/get-site-options';
import { isJetpackSite } from 'state/sites/selectors';
import isVipSite from 'state/selectors/is-vip-site';
import isAtomicSite from 'state/selectors/is-site-automated-transfer';
import { getSelectedSiteId } from 'state/ui/selectors';
import getSite from './get-site';
import { abtest } from 'lib/abtest';

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

	if ( abtest( 'customerHomeAll' ) === 'control' ) {
		const siteOptions = getSiteOptions( state, siteId );
		const createdAt = get( siteOptions, 'created_at', '' );

		if (
			! createdAt ||
			createdAt.substr( 0, 4 ) === '0000' ||
			new Date( createdAt ) < new Date( '2019-08-06' )
		) {
			return false;
		}
	}

	const site = getSite( state, siteId );
	return site && !! canCurrentUser( state, siteId, 'manage_options' );
}
