import type { Field, View } from '@wordpress/dataviews';

/**
 * Sanitize view by removing any invalid or malformed entries.
 */
export function sanitizeView( view: View, fields: Field< any >[] ) {
	// If no sanitization is needed then a reference to the same object should be returned.
	const sanitized = view;
	const fieldsSet = new Set( fields.map( ( field ) => field.id ) );
	sanitized.filters = sanitized.filters?.filter( ( filter ) => {
		if ( ! fieldsSet.has( filter.field ) ) {
			return false;
		}
		if ( filter.value !== undefined ) {
			if ( filter.operator === 'is' && Array.isArray( filter.value ) ) {
				return false;
			}
			if ( filter.operator === 'isAny' && ! Array.isArray( filter.value ) ) {
				return false;
			}
		}
		return true;
	} );

	return sanitized;
}
