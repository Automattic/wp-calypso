/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import Dispatcher from 'dispatcher';
import { action as ActionTypes } from 'lib/dss/constants';

const debug = debugFactory( 'calypso:dss' );

// DynamicScreenshotsActions
export default {
	fetchThemePreview( themeSlug ) {
		const endpoint = '/dss/theme:' + encodeURIComponent( themeSlug );
		debug( 'requesting dynamic-screenshots theme preview for', themeSlug );
		wpcom.req.get( endpoint, ( error, preview ) => {
			Dispatcher.handleServerAction( {
				type: ActionTypes.DSS_RECEIVE_THEME_PREVIEW,
				error,
				preview,
				themeSlug: themeSlug
			} );
		} );
	},

	resetScreenshots() {
		Dispatcher.handleViewAction( {
			type: ActionTypes.DSS_CLEAR_IMAGES
		} );
	},

	updateScreenshotsFor( searchTerm ) {
		Dispatcher.handleViewAction( {
			type: ActionTypes.DSS_UPDATE_IMAGES,
			searchTerm: searchTerm
		} );
	},

	fetchDSSImageFor( searchTerm ) {
		Dispatcher.handleViewAction( {
			type: ActionTypes.DSS_LOADING_IMAGES
		} );
		const endpoint = '/placeholderimages';
		const endpointArguments = { search: searchTerm };
		debug( 'Making DSS API request for', searchTerm );
		wpcom.req.get( endpoint, endpointArguments, ( error, data ) => {
			Dispatcher.handleServerAction( {
				type: ActionTypes.DSS_RECEIVE_IMAGES,
				error,
				data,
				searchTerm: searchTerm
			} );
		} );
	}
};
