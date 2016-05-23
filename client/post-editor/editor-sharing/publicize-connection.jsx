/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import includes from 'lodash/includes';

/**
 * Internal dependencies
 */
import FormCheckbox from 'components/forms/form-checkbox';
import PostMetadata from 'lib/post-metadata';
import PostActions from 'lib/posts/actions';
import * as PostStats from 'lib/posts/stats';
import Notice from 'components/notice';
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'EditorSharingPublicizeConnection',

	propTypes: {
		post: PropTypes.object,
		connection: PropTypes.object,
		onRefresh: PropTypes.func
	},

	getDefaultProps() {
		return {
			onRefresh: () => {}
		};
	},

	isConnectionSkipped() {
		const { post, connection } = this.props;
		return post && connection && includes( PostMetadata.publicizeSkipped( post ), connection.keyring_connection_ID );
	},

	isConnectionDone() {
		const { post, connection } = this.props;
		return post && connection && includes( PostMetadata.publicizeDone( post ), connection.keyring_connection_ID );
	},

	isDisabled() {
		const { connection } = this.props;
		return ! connection || this.isConnectionDone() || connection.read_only;
	},

	onChange( event ) {
		const { connection } = this.props;
		if ( ! connection ) {
			return;
		}

		if ( event.target.checked ) {
			// TODO: REDUX - remove flux actions when whole post-editor is reduxified
			PostActions.deleteMetadata( '_wpas_skip_' + connection.keyring_connection_ID );
			PostStats.recordStat( 'sharing_enabled_' + connection.service );
			PostStats.recordEvent( 'Publicize Service', connection.service, 'enabled' );
		} else {
			// TODO: REDUX - remove flux actions when whole post-editor is reduxified
			PostActions.updateMetadata( '_wpas_skip_' + connection.keyring_connection_ID, 1 );
			PostStats.recordStat( 'sharing_disabled_' + connection.service );
			PostStats.recordEvent( 'Publicize Service', connection.service, 'disabled' );
		}
	},

	renderBrokenConnection() {
		const { connection } = this.props;
		if ( ! connection || connection.status !== 'broken' ) {
			return;
		}

		return (
			<Notice className="editor-sharing__broken-publicize-connection" status="is-warning" showDismiss={ false }>
				{ this.translate( 'There is an issue connecting to %s. {{button}}Reconnect {{icon/}}{{/button}}', {
					args: connection.label,
					components: {
						button: (
							<button
								type="button"
								onClick={ this.props.onRefresh }
								className="editor-sharing__broken-publicize-connection-button" />
						),
						icon: (
							<Gridicon icon="external" size={ 18 } />
						)
					}
				} ) }
			</Notice>
		);
	},

	render() {
		const { connection } = this.props;

		return (
			<div className="editor-sharing__publicize-connection">
				<label>
					<FormCheckbox
						checked={ ! this.isConnectionSkipped() }
						disabled={ this.isDisabled() }
						onChange={ this.onChange } />
					<span>{ connection && connection.external_display }</span>
				</label>
				{ this.renderBrokenConnection() }
			</div>
		);
	}
} );
