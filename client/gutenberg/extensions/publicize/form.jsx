/**
 * Higher Order Publicize sharing form composition.
 *
 * Uses Gutenberg data API to dispatch publicize form data to
 * editor post data in format to match 'publicize' field
 * schema defined in {@see class-jetpack-publicize-gutenberg.php}
 *
 * @since  5.9.1
 */

/**
 * External dependencies
 */
import { compose } from '@wordpress/compose';
import { isNil } from 'lodash';
import { withSelect, withDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import PublicizeFormUnwrapped from './form-unwrapped';

const PublicizeForm = compose( [
	withSelect( ( select ) => ( {
		activeConnections: ( isNil( select( 'core/editor' ).getEditedPostAttribute( 'publicize' ) ) )
			? [] : select( 'core/editor' ).getEditedPostAttribute( 'publicize' ).connections,
		shareMessage: ( isNil( select( 'core/editor' ).getEditedPostAttribute( 'publicize' ) ) )
			? '' : select( 'core/editor' ).getEditedPostAttribute( 'publicize' ).title,
	} ) ),
	withDispatch( ( dispatch, ownProps ) => ( {
		/**
		 * Directly sets post's publicize data.
		 *
		 * Sets initial values for publicize data this saved with post. Field schema defined in
		 * {@see class-jetpack-publicize-gutenberg.php}. Input parameters are used as defaults.
		 * They will be ignored if the 'publicize' field has already been set. This prevents
		 * user changes from being erased every time pre-publish panel is opened and closed.
		 *
		 * @since 5.9.1
		 *
		 * @param {string} initTitle             String to share post with
		 * @param {array}  initActiveConnections Array of connection data {@see class-jetpack-publicize-gutenberg.php}
		 */
		initializePublicize( initTitle, initActiveConnections ) {
			const {
				activeConnections,
				shareMessage,
			} = ownProps;
			const newConnections = ( activeConnections.length > 0 ) ? activeConnections : initActiveConnections;
			const newTitle = ( shareMessage.length > 0 ) ? shareMessage : initTitle;
			dispatch( 'core/editor' ).editPost( {
				publicize: {
					title: newTitle,
					connections: newConnections,
				}
			} );
		},

		/**
		 * Update state connection enable/disable state based on checkbox.
		 *
		 * Saves enable/disable value to connections property in editor
		 * in field 'publicize'.
		 *
		 * @since 5.9.1
		 *
		 * @param {Object}  options              Top-level options parameter
		 * @param {string}  options.connectionID ID of the connection being enabled/disabled
		 * @param {boolean} options.shouldShare  True of connection should be shared to, false otherwise
		 */
		connectionChange( options ) {
			const { connectionID, shouldShare } = options;
			const { activeConnections, shareMessage } = ownProps;
			// Copy array (simply mutating data would cause the component to not be updated).
			const newConnections = activeConnections.slice( 0 );
			newConnections.forEach( ( c ) => {
				if ( c.unique_id === connectionID ) {
					c.should_share = shouldShare;
				}
			} );
			dispatch( 'core/editor' ).editPost( {
				publicize: {
					title: shareMessage,
					connections: newConnections,
				}
			} );
		},

		/**
		 * Handler for when sharing message is edited.
		 *
		 * Saves edited message to state and to the editor
		 * in field 'publicize'.
		 *
		 * @since 5.9.1
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
				}
			} );
		}
	} ) ),
] )( PublicizeFormUnwrapped );

export default PublicizeForm;
