// Ensure Tracks Library
window._tkq = window._tkq || [];

let tracksIdentity = null;

/**
 * Populate `identity` on WPCOM and ATOMIC to enable tracking.
 * Always disabled for regular self-hosted installations.
 *
 * @param {object} identity Info about identity.
 * @param {number} identity.userid User ID.
 * @param {string} identity.username Username.
 * @param {number} identity.blogid Blog ID.
 * @returns {void}
 */
export const initializeWithIdentity = ( identity ) => {
	tracksIdentity = identity;
	window._tkq.push( [ 'identifyUser', identity.userid, identity.username ] );
};

/**
 * Track a view of the layout selector.
 *
 * @param {string} segment_id Segment ID.
 * @param {string} vertical_id Vertical ID.
 * @param {string} source Source triggering the view.
 * @returns {void}
 */
export const trackView = ( segment_id, vertical_id, source ) => {
	if ( ! tracksIdentity ) {
		return;
	}
	window._tkq.push( [
		'recordEvent',
		'a8c_full_site_editing_template_selector_view',
		{
			blog_id: tracksIdentity.blogid,
			segment_id,
			vertical_id,
			source,
		},
	] );
};

/**
 * Track closing of the layout selector.
 *
 * @param {string} segment_id Segment ID.
 * @param {string} vertical_id Vertical ID.
 * @returns {void}
 */
export const trackDismiss = ( segment_id, vertical_id ) => {
	if ( ! tracksIdentity ) {
		return;
	}
	window._tkq.push( [
		'recordEvent',
		'a8c_full_site_editing_template_selector_dismiss',
		{
			blog_id: tracksIdentity.blogid,
			segment_id,
			vertical_id,
		},
	] );
};

/**
 * Track layout selection.
 *
 * @param {string} segment_id Segment ID.
 * @param {string} vertical_id Vertical ID.
 * @param {string} template Template slug.
 * @returns {void}
 */
export const trackSelection = ( segment_id, vertical_id, template ) => {
	if ( ! tracksIdentity ) {
		return;
	}
	window._tkq.push( [
		'recordEvent',
		'a8c_full_site_editing_template_selector_template_selected',
		{
			blog_id: tracksIdentity.blogid,
			segment_id,
			vertical_id,
			template,
		},
	] );
};
