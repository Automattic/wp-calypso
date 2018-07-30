/**
 * Publicize sharing panel component.
 *
 * Displays Publicize notifications if no
 * services are connected or displays form if
 * services are connected.
 *
 * {@see publicize.php/save_meta()}
 *
 * @since  5.9.1
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
import React, { Component } from 'react';
import { compose } from 'redux';

/**
 * Internal dependencies
 */
import {
	requestPublicizeConnections,
} from './async-publicize-lib';
import PublicizeNoConnections from './publicize-no-connections';
const {
	withSelect,
	withDispatch,
} = window.wp.data;

import PublicizeForm from './publicize-form';
import PublicizeConnectionVerify from './publicize-connection-verify';
const { __ } = window.wp.i18n;
const { PanelBody } = window.wp.components;

class PublicizePanel extends Component {
	constructor( props ) {
		super( props );
	}

	componentDidMount() {
		const { getConnectionsStart } = this.props;
		getConnectionsStart();
	}

	render() {
		const { connections, isLoading, getConnectionsStart } = this.props;
		const refreshText = isLoading ? __( 'Refreshing…' ) : __( 'Refresh connections' );
		return (
			<PanelBody
				initialOpen={ true }
				id="publicize-title"
				title={
					<span id="publicize-defaults" key="publicize-title-span">
						{ __( 'Share this post' ) }
					</span>
				}
			>
				<div>{ __( 'Connect and select social media services to share this post.' ) }</div>
				{ ( connections.length > 0 ) && <PublicizeForm staticConnections={ connections } refreshCallback={ getConnectionsStart } /> }
				{ ( 0 === connections.length ) && <PublicizeNoConnections refreshCallback={ getConnectionsStart } /> }
				<a tabIndex="0" onClick={ getConnectionsStart } disabled={ isLoading }>
					{ refreshText }
				</a>
				{ ( connections.length > 0 ) && <PublicizeConnectionVerify /> }
			</PanelBody>
		);
	}
}

export default PublicizePanel = compose(
	withSelect( ( select ) => ( {
		connections: select( 'jetpack/publicize' ).getConnections(),
		isLoading: select( 'jetpack/publicize' ).getIsLoading(),
		postId: select( 'core/editor' ).getCurrentPost().id,
	} ) ),
	withDispatch( ( dispatch, ownProps ) => ( {
		getConnectionsDone: dispatch( 'jetpack/publicize' ).getConnectionsDone,
		getConnectionsFail: dispatch( 'jetpack/publicize' ).getConnectionsFail,
		/**
		 * Starts request for current list of connections.
		 *
		 * @since 5.9.1
		 */
		getConnectionsStart() {
			const { postId } = ownProps;
			const {
				getConnectionsDone,
				getConnectionsFail,
			} = dispatch( 'jetpack/publicize' );
			dispatch( 'jetpack/publicize' ).getConnectionsStart();
			requestPublicizeConnections( postId ).then(
				( result ) => getConnectionsDone( result ),
				() => getConnectionsFail(),
			);
		},
	} ) ),
)( PublicizePanel );
