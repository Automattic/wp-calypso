/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'state/ui/selectors';
import { abtest } from 'lib/abtest';
import { canCurrentUserUseChecklistMenu } from 'state/sites/selectors';

/**
 * Returns true if the current should be able to use the customer home screen
 *
 * @param  {Object}   state  Global state tree
 * @param  {Number}   siteId Site ID
 * @return {?Boolean}        Whether the site can use the customer home screen
 */
export default function isSiteEligibleForCustomerHome( state, siteId = null ) {
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}
	return 'show' === abtest( 'customerHomePage' ) && canCurrentUserUseChecklistMenu( state, siteId );
}
