// Ensure Tracks Library
window._tkq = window._tkq || [];

let tracksIdentity = null;

/**
 * Populate `identity` on WPCOM and ATOMIC to enable tracking.
 * Always disabled for regular self-hosted installations.
 */
export const initializeWithIdentity = identity => {
	tracksIdentity = identity;
	window._tkq.push( [ 'identifyUser', identity.userid, identity.username ] );
};

export const trackView = ( segment_id, vertical_id ) => {
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
		},
	] );
};

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
