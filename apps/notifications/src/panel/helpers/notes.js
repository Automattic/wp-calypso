export {
	getActions,
	getEditCommentLink,
	getNewPostLink,
	getReferenceId,
} from '../../common/actions';

/**
 * Returns the URL to the pending comments management page for the given site.
 *
 * Stays here rather than src/common: it reads document.location.
 * @param {number|null} siteId Site ID whose pending comments management page URL should be returned.
 * @returns {string|null}
 */
export function getCommentsUrl( siteId ) {
	if ( ! siteId ) {
		return null;
	}
	// Notifications are hosted on widgets.wp.com on WordPress.com
	const host =
		document.location.host === 'widgets.wp.com' ? 'wordpress.com' : document.location.host;
	return `${ document.location.protocol }//${ host }/comments/pending/${ siteId }`;
}
