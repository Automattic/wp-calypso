/**
 * Internal dependencies
 */
import { isJetpackModuleActive } from 'state/sites/selectors';
import { isPrivateSite } from './';

/**
 * Returns false only if the site is known to not support editing images, or
 * true otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether site supports editing images
 */
export default function isSiteSupportingImageEditor( state, siteId ) {
	return (
		true !== isPrivateSite( state, siteId ) &&
		false !== isJetpackModuleActive( state, siteId, 'photon' )
	);
}
