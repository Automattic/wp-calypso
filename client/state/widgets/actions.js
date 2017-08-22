/**
 * Internal dependencies
 */
import {
	WIDGET_ADD_REQUEST,
	WIDGET_ADD_REQUEST_SUCCESS,
	WIDGET_ADD_REQUEST_FAILURE,
} from 'state/action-types';
import wp from 'lib/wp';

/**
 * Add a widget into a sidebar of a specific site.
 *
 * @param {number} siteId   The ID of the site where this widget will be added.
 * @param {object} widgetOptions {
 * 		@type {string} id_base  The base ID of the widget.
 * 		@type {string} sidebar  Optional. The ID of the sidebar where this widget will be active.
 * 								If empty, the widget will be added in the first sidebar available.',
 * 		@type {string} position Optional. The position of the widget in the sidebar.
 * 		@type {string} settings Optional. The settings for the new widget.
 * }
 * @returns {function} Action thunk to fetch the widget options when called.
 */
export function addWidget( siteId, widgetOptions ) {
	return ( dispatch ) => {
		dispatch( {
			type: WIDGET_ADD_REQUEST,
			siteId,
			widgetOptions
		} );

		return wp.undocumented().addWidget( siteId, widgetOptions )
			.then( () => {
				dispatch( {
					type: WIDGET_ADD_REQUEST_SUCCESS,
					siteId,
					widgetOptions
				} );
			} ).catch( ( error ) => {
				dispatch( {
					type: WIDGET_ADD_REQUEST_FAILURE,
					siteId,
					widgetOptions,
					error: error.message
				} );
			} );
	};
}
