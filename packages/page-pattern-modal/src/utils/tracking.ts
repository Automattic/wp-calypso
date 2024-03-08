declare global {
	interface Window {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		_tkq: Array< Array< any > >;
	}
}

// Ensure Tracks Library
window._tkq = window._tkq || [];

interface Identity {
	blogid: number;
	userid: number;
	username: string;
}

let tracksIdentity: Identity | null = null;

/**
 * Populate `identity` on WPCOM and ATOMIC to enable tracking.
 * Always disabled for regular self-hosted installations.
 * @param identity Info about identity.
 */
export const initializeWithIdentity = ( identity: Identity ): void => {
	tracksIdentity = identity;
	window._tkq.push( [ 'identifyUser', identity.userid, identity.username ] );
};

/**
 * Track a view of the layout selector.
 * @param source Source triggering the view.
 */
export const trackView = ( source: string ): void => {
	if ( ! tracksIdentity ) {
		return;
	}
	window._tkq.push( [
		'recordEvent',
		'a8c_full_site_editing_template_selector_view',
		{
			blog_id: tracksIdentity.blogid,
			source,
		},
	] );
};

/**
 * Track closing of the layout selector.
 */
export const trackDismiss = (): void => {
	if ( ! tracksIdentity ) {
		return;
	}
	window._tkq.push( [
		'recordEvent',
		'a8c_full_site_editing_template_selector_dismiss',
		{
			blog_id: tracksIdentity.blogid,
		},
	] );
};

/**
 * Track layout selection.
 * @param pattern Pattern slug.
 */
export const trackSelection = ( pattern: string ): void => {
	if ( ! tracksIdentity ) {
		return;
	}
	window._tkq.push( [
		'recordEvent',
		'a8c_full_site_editing_template_selector_template_selected',
		{
			blog_id: tracksIdentity.blogid,
			pattern,
		},
	] );
};
