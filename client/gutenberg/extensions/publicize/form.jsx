/** @format */

/**
 * Higher Order Publicize sharing form composition.
 *
 * Uses Gutenberg data API to dispatch publicize form data to
 * editor post data in format to match 'publicize' field schema.
 */

/**
 * External dependencies
 */
import { compose } from '@wordpress/compose';
import { withSelect, withDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import PublicizeFormUnwrapped from './form-unwrapped';

const PublicizeForm = compose( [
	withSelect( select => ( {
		activeConnections: select( 'core/editor' ).getEditedPostAttribute(
			'jetpack_publicize_connections'
		),
		shareMessage: select( 'core/editor' ).getEditedPostAttribute( 'jetpack_publicize_message' ),
	} ) ),
	withDispatch( ( dispatch, ownProps ) => ( {
		/**
		 * Directly sets post's publicize data.
		 *
		 * Sets initial values for publicize data this saved with post.
		 * Input parameters are used as defaults.
		 * They will be ignored if the 'publicize' field has already been set. This prevents
		 * user changes from being erased every time pre-publish panel is opened and closed.
		 *
		 * @param {string} initTitle             String to share post with
		 * @param {array}  initActiveConnections Array of connection data
		 */
		initializePublicize( initTitle, initActiveConnections ) {
			const { activeConnections, shareMessage } = ownProps;
			const newConnections =
				activeConnections.length > 0 ? activeConnections : initActiveConnections;
			const newTitle = shareMessage.length > 0 ? shareMessage : initTitle;
			dispatch( 'core/editor' ).editPost( {
				publicize: {
					title: newTitle,
					connections: newConnections,
				},
			} );
		},

		/**
		 * Toggle connection enable/disable state based on checkbox.
		 *
		 * Saves enable/disable value to connections property in editor
		 * in field 'jetpack_publicize_connections'.
		 *
		 * @param {number}  id ID of the connection being enabled/disabled
		 */
		toggleConnection( id ) {
			const newConnections = ownProps.activeConnections.map( c => ( {
				...c,
				enabled: c.id === id ? ! c.enabled : c.enabled,
			} ) );

			dispatch( 'core/editor' ).editPost( {
				jetpack_publicize_connections: newConnections,
			} );
		},

		/**
		 * Handler for when sharing message is edited.
		 *
		 * Saves edited message to state and to the editor
		 * in field 'publicize'.
		 *
		 * @param {object} event Change event data from textarea element.
		 */
		messageChange( event ) {
			let { shareMessage } = ownProps;
			const { activeConnections } = ownProps;
			shareMessage = event.target.value;
			dispatch( 'core/editor' ).editPost( {
				publicize: {
					title: shareMessage,
					connections: activeConnections,
				},
			} );
		},
	} ) ),
] )( PublicizeFormUnwrapped );

export default PublicizeForm;
