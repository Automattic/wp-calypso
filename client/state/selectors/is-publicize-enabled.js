/**
 * Internal dependencies
 */
import { isJetpackModuleActive, getSiteOption } from 'state/sites/selectors';
import { postTypeSupports } from 'state/post-types/selectors';

/**
 * Returns true if Publicize is enabled for the post type and the given site.
 *
 * @param {Object} state 	Global state tree
 * @param {Number} siteId 	Site ID
 * @param {String} postType Post type slug
 *
 * @return {Boolean} True when enabled
 */
export default function isPublicizeEnabled( state, siteId, postType ) {
	return true !== getSiteOption( state, siteId, 'publicize_permanently_disabled' ) &&
		false !== isJetpackModuleActive( state, siteId, 'publicize' ) &&
		postTypeSupports( state, siteId, postType, 'publicize' );
}
