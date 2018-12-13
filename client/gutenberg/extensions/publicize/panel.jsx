/** @format */

/**
 * Publicize sharing panel component.
 *
 * Displays Publicize notifications if no
 * services are connected or displays form if
 * services are connected.
 */

// Since this is a Jetpack originated block in Calypso codebase,
// we're relaxing some accessibility rules.
/* eslint jsx-a11y/anchor-is-valid: 0 */
/* eslint jsx-a11y/click-events-have-key-events: 0 */
/* eslint jsx-a11y/no-static-element-interactions: 0 */
/* eslint jsx-a11y/no-noninteractive-tabindex: 0 */

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
import { __ } from 'gutenberg/extensions/presets/jetpack/utils/i18n';

const PublicizePanel = ( { connections, refreshConnections } ) => (
	<Fragment>
		{ connections.some( connection => connection.enabled ) && <PublicizeConnectionVerify /> }
		<div>{ __( "Connect and select the accounts where you'd like to share your post." ) }</div>
		{ connections &&
			connections.length > 0 && <PublicizeForm refreshCallback={ refreshConnections } /> }
		{ connections &&
			0 === connections.length && (
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
