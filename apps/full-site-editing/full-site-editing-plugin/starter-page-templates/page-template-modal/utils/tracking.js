// Ensure Tracks Library
window._tkq = window._tkq || [];

export const trackView = vertical_id => {
	window._tkq.push( [
		'recordEvent',
		'a8c_test_full_site_editing_template_selector_view',
		{ vertical_id },
	] );
};

export const trackDismiss = vertical_id => {
	window._tkq.push( [
		'recordEvent',
		'a8c_test_full_site_editing_template_selector_dismiss',
		{ vertical_id },
	] );
};

export const trackSelection = ( vertical_id, template ) => {
	window._tkq.push( [
		'recordEvent',
		'a8c_test_full_site_editing_template_selector_template_selected',
		{ vertical_id, template },
	] );
};
