// Ensure Tracks Library
window._tkq = window._tkq || [];

let tracksIdentity = null;

export const initializeWithIdentity = identity => {
	tracksIdentity = identity;
	window._tkq.push( [ 'identifyUser', identity.userid, identity.username ] );
};

export const trackView = vertical_id => {
	if ( ! tracksIdentity ) {
		return;
	}
	window._tkq.push( [
		'recordEvent',
		'a8c_test_full_site_editing_template_selector_view',
		{
			blog_id: tracksIdentity.blogid,
			vertical_id,
		},
	] );
};

export const trackDismiss = vertical_id => {
	if ( ! tracksIdentity ) {
		return;
	}
	window._tkq.push( [
		'recordEvent',
		'a8c_test_full_site_editing_template_selector_dismiss',
		{
			blog_id: tracksIdentity.blogid,
			vertical_id,
		},
	] );
};

export const trackSelection = ( vertical_id, template ) => {
	if ( ! tracksIdentity ) {
		return;
	}
	window._tkq.push( [
		'recordEvent',
		'a8c_test_full_site_editing_template_selector_template_selected',
		{
			blog_id: tracksIdentity.blogid,
			vertical_id,
			template,
		},
	] );
};
