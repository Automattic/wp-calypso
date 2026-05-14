import apiFetch from '@wordpress/api-fetch';

/**
 * Normalizes a page title field that might be null to the standard WP REST API
 * format of `{raw: '', rendered: ''}`.
 *
 * On WordPress.com, pages published without a title may have their `title` field
 * returned as `null` from the REST API instead of the standard WP REST API format
 * of `{raw: '', rendered: ''}`. This causes the Navigation block to crash with
 * "This block has encountered an error and cannot be previewed" when it tries to
 * access `page.title.rendered`.
 *
 * @param {Object|null|undefined} title The title field from a REST API response.
 * @returns {Object} The normalized title object with `raw` and `rendered` string fields.
 */
export function normalizeTitle( title ) {
	if ( title === null || title === undefined ) {
		return { raw: '', rendered: '' };
	}
	return {
		...title,
		raw: title.raw ?? '',
		rendered: title.rendered ?? '',
	};
}

/**
 * Normalizes an entity record that may have a null title field.
 *
 * @param {*} record An entity record from a REST API response.
 * @returns {*} The record with a normalized title field, or the original value if
 *              not a plain object with a title field.
 */
export function normalizeEntityRecord( record ) {
	if ( record && typeof record === 'object' && 'title' in record ) {
		return { ...record, title: normalizeTitle( record.title ) };
	}
	return record;
}

/**
 * Normalizes a REST API response to ensure title fields are valid objects.
 *
 * @param {*} response A REST API response (array or single object).
 * @returns {*} The normalized response.
 */
export function normalizeRestResponse( response ) {
	if ( Array.isArray( response ) ) {
		return response.map( normalizeEntityRecord );
	}
	return normalizeEntityRecord( response );
}

/**
 * Registers an apiFetch middleware that normalizes null page titles in REST API
 * responses.
 *
 * WordPress.com can return pages without titles as `title: null` instead of the
 * standard WP REST API format `{raw: '', rendered: ''}`. The Navigation block
 * (core/navigation) crashes when it encounters a null title because it expects
 * `page.title.rendered` to be a string. This bug is not reproducible on
 * self-hosted WordPress, which always returns title as an object.
 *
 * This middleware normalizes null titles to empty strings so the Navigation block
 * renders correctly when untitled pages are added to it in the Site Editor.
 */
apiFetch.use( function fixNavigationBlockMissingTitles( options, next ) {
	return next( options ).then( normalizeRestResponse );
} );
