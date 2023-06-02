import { isEnabled } from '@automattic/calypso-config';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';

import 'calypso/state/themes/init';

/**
 * Whether a site can see premium themes at all.
 *
 * @param  {Object}  state   Global state tree
 * @param  {number}  siteId  Site ID, optional
 * @returns {boolean}        True if the site should see premium themes in the showcase
 */
export function arePremiumThemesEnabled( state, siteId ) {
	if ( ! siteId ) {
		return isEnabled( 'themes/premium' );
	}
	const isJetpack = isJetpackSite( state, siteId );
	const isAtomic = isSiteAutomatedTransfer( state, siteId );
	const isStandaloneJetpack = isJetpack && ! isAtomic;
	return isEnabled( 'themes/premium' ) && ! isStandaloneJetpack;
}
