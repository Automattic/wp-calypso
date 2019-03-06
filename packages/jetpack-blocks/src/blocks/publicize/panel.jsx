/**
 * Publicize sharing panel component.
 *
 * Displays Publicize notifications if no
 * services are connected or displays form if
 * services are connected.
 */

/**
 * External dependencies
 */
import { compose } from '@wordpress/compose';
import { Fragment } from '@wordpress/element';
import { withDispatch, withSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import PublicizeConnectionVerify from './connection-verify';
import PublicizeForm from './form';
import PublicizeSettingsButton from './settings-button';
import { __ } from '../../utils/i18n';

const PublicizePanel = ( { connections, refreshConnections } ) => (
	<Fragment>
		{ connections && connections.some( connection => connection.enabled ) && (
			<PublicizeConnectionVerify />
		) }
		<div>{ __( "Connect and select the accounts where you'd like to share your post." ) }</div>
		{ connections && connections.length > 0 && (
			<PublicizeForm refreshCallback={ refreshConnections } />
		) }
		{ connections && 0 === connections.length && (
			<PublicizeSettingsButton
				className="jetpack-publicize-add-connection-wrapper"
				refreshCallback={ refreshConnections }
			/>
		) }
	</Fragment>
);

export default compose( [
	withSelect( select => ( {
		connections: select( 'core/editor' ).getEditedPostAttribute( 'jetpack_publicize_connections' ),
	} ) ),
	withDispatch( dispatch => ( {
		refreshConnections: dispatch( 'core/editor' ).refreshPost,
	} ) ),
] )( PublicizePanel );
