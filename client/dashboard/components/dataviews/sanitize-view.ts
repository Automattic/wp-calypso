import type { Field, SupportedLayouts, View } from '@wordpress/dataviews';

/*
 * DataViews renders nothing for a layout it wasn't given, including its reset control. A saved view can name one
 * when a screen drops a layout, or when a build that offers it shares the user's preferences, so keep the view on the screen's first layout.
 */
function withAvailableLayout( view: View, layouts?: SupportedLayouts ) {
	const [ fallback ] = Object.entries( layouts ?? {} );
	if ( ! layouts || ! fallback || layouts[ view.type ] ) {
		return view;
	}

	const [ type, layoutDefaults ] = fallback;
	const { layout, ...viewWithoutLayout } = view;
	return {
		...viewWithoutLayout,
		type,
		...( layoutDefaults === true ? {} : layoutDefaults ),
	} as View;
}

/**
 * Sanitize view by removing any invalid or malformed entries.
 */
export function sanitizeView( view: View, fields: Field< any >[], layouts?: SupportedLayouts ) {
	// If no sanitization is needed then a reference to the same object should be returned.
	const sanitized = withAvailableLayout( view, layouts );
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
