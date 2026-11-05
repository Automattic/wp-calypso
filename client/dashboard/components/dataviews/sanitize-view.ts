import { VIEW_LAYOUTS } from '@wordpress/dataviews';
import type { Field, SupportedLayouts, View } from '@wordpress/dataviews';

// What DataViews falls back to when a screen doesn't name its layouts.
const DATAVIEWS_DEFAULT_LAYOUTS: SupportedLayouts = { table: {}, grid: {}, list: {} };

// DataViews ignores picker layouts, so a screen can name layouts it won't render.
function getAvailableLayouts( layouts: SupportedLayouts = DATAVIEWS_DEFAULT_LAYOUTS ) {
	return Object.entries( layouts ).filter(
		( [ type, layout ] ) =>
			layout && VIEW_LAYOUTS.some( ( view ) => view.type === type && ! view.isPicker )
	);
}

export function isLayoutAvailable( type: View[ 'type' ], layouts?: SupportedLayouts ) {
	return getAvailableLayouts( layouts ).some( ( [ availableType ] ) => availableType === type );
}

/*
 * DataViews renders nothing for a layout it wasn't given, including its reset control. A saved view can name one
 * when a screen drops a layout, or when a build that offers it shares the user's preferences, so keep the view on the screen's first layout.
 */
function withAvailableLayout( view: View, layouts?: SupportedLayouts ) {
	const [ fallback ] = getAvailableLayouts( layouts );
	if ( ! fallback || isLayoutAvailable( view.type, layouts ) ) {
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
