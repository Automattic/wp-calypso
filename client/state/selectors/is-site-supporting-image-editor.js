/**
 * Internal dependencies
 */

import { isJetpackModuleActive } from 'calypso/state/sites/selectors';
import isPrivateSite from 'calypso/state/selectors/is-private-site';

/**
 * Returns false only if the site is known to not support editing images, or
 * true otherwise.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean}        Whether site supports editing images
 */
export default function isSiteSupportingImageEditor( state, siteId ) {
	return (
		true !== isPrivateSite( state, siteId ) &&
		false !== isJetpackModuleActive( state, siteId, 'photon' )
	);
}
