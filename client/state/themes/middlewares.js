/**
 * External dependencies
 */
import analytics from 'redux-analytics';

/**
 * Internal dependencies
 */
import { tracks } from 'analytics';

export const analyticsMiddleware = analytics( ( { type, payload } ) => {
	switch ( type ) {
		case 'calypso_themeshowcase_search':
		case 'calypso_themeshowcase_theme_activate':
			tracks.recordEvent( type, payload );
	}
} );
