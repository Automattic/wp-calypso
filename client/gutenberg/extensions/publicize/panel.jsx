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
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import { compose } from '@wordpress/compose';
import { PanelBody } from '@wordpress/components';
import { withSelect, withDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import PublicizeConnectionVerify from './connection-verify';
import PublicizeForm from './form';
import PublicizeNoConnections from './no-connections';
import { requestPublicizeConnections } from './async-publicize-lib';

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

export default PublicizePanel = compose( [
	withSelect( ( select ) => ( {
		connections: select( 'a8c/publicize' ).getConnections(),
		isLoading: select( 'a8c/publicize' ).getIsLoading(),
		postId: select( 'core/editor' ).getCurrentPost().id,
	} ) ),
	withDispatch( ( dispatch, ownProps ) => ( {
		getConnectionsDone: dispatch( 'a8c/publicize' ).getConnectionsDone,
		getConnectionsFail: dispatch( 'a8c/publicize' ).getConnectionsFail,
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
			} = dispatch( 'a8c/publicize' );
			dispatch( 'a8c/publicize' ).getConnectionsStart();
			requestPublicizeConnections( postId ).then(
				( result ) => getConnectionsDone( result ),
				() => getConnectionsFail(),
			);
		},
	} ) ),
] )( PublicizePanel );
