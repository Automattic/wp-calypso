import { postTypeSupports } from 'calypso/state/post-types/selectors';
import { isJetpackModuleActive, getSiteOption } from 'calypso/state/sites/selectors';

/**
 * Returns true if Publicize is enabled for the post type and the given site.
 *
 * @param {Object} state 	Global state tree
 * @param {number} siteId 	Site ID
 * @param {string} postType Post type slug
 * @returns {boolean} True when enabled
 */
export default function isPublicizeEnabled( state, siteId, postType ) {
	return (
		true !== getSiteOption( state, siteId, 'publicize_permanently_disabled' ) &&
		false !== isJetpackModuleActive( state, siteId, 'publicize' ) &&
		postTypeSupports( state, siteId, postType, 'publicize' )
	);
}
