import type { Field, View } from '@wordpress/dataviews';

/**
 * Sanitize view by removing any invalid or malformed entries.
 */
export function sanitizeView( view: View, fields: Field< any >[] ) {
	// If no sanitization is needed then a reference to the same object should be returned.
	let sanitized = view;

	if ( sanitized.type === 'grid' && sanitized.layout?.previewSize ) {
		// From PreviewSizePicker imageSizes in GB https://github.com/WordPress/gutenberg/blob/58a5abc7714bdff204d5f6bc350980f73686d54f/packages/dataviews/src/dataviews-layouts/grid/preview-size-picker.tsx#L14-L39
		const smallestSize = 120;
		if ( isNaN( sanitized.layout.previewSize ) || sanitized.layout.previewSize < smallestSize ) {
			delete sanitized.layout.previewSize;
		}
	}

	if ( sanitized.sort?.field ) {
		const field = fields.find( ( field ) => field.id === sanitized.sort?.field );
		if ( ! field || field.enableSorting === false ) {
			const { sort, ...rest } = sanitized;
			sanitized = rest;
		}
	}

	const fieldsSet = new Set( fields.map( ( field ) => field.id ) );
	view.filters = view.filters?.filter( ( filter ) => fieldsSet.has( filter.field ) );

	return sanitized;
}
