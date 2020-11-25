/**
 * Internal dependencies
 */
import getSiteOption from './get-site-option';

/**
 * Returns the Anchor podcasting ID linked to a podcasting site, or null if
 * the site is not a podcasting site.
 *
 * @param  {object}  state  Global state tree
 * @param  {?number}  siteId Site ID
 * @returns {?string}        Anchor podcast ID
 */
export default ( state, siteId ) => getSiteOption( state, siteId, 'anchor_podcast' );
