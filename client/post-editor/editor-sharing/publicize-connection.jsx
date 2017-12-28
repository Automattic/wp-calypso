/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { includes } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import FormCheckbox from 'client/components/forms/form-checkbox';
import PostMetadata from 'client/lib/post-metadata';
import PostActions from 'client/lib/posts/actions';
import * as PostStats from 'client/lib/posts/stats';
import Notice from 'client/components/notice';
import NoticeAction from 'client/components/notice/notice-action';

export class EditorSharingPublicizeConnection extends React.Component {
	static propTypes = {
		post: PropTypes.object,
		connection: PropTypes.object,
		onRefresh: PropTypes.func,
		label: PropTypes.string,
	};

	static defaultProps = {
		onRefresh: () => {},
	};

	isConnectionSkipped = () => {
		const { post, connection } = this.props;
		return (
			post &&
			connection &&
			includes( PostMetadata.publicizeSkipped( post ), connection.keyring_connection_ID )
		);
	};

	isConnectionDone = () => {
		const { post, connection } = this.props;
		return (
			post &&
			connection &&
			includes( PostMetadata.publicizeDone( post ), connection.keyring_connection_ID )
		);
	};

	isDisabled = () => {
		const { connection } = this.props;
		return ! connection || connection.read_only;
	};

	onChange = event => {
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
	};

	renderBrokenConnection = () => {
		const { connection } = this.props;
		if ( ! connection || connection.status !== 'broken' ) {
			return;
		}

		return (
			<Notice
				isCompact
				className="editor-sharing__broken-publicize-connection"
				status="is-warning"
				showDismiss={ false }
			>
				{ this.props.translate( 'There is an issue connecting to %s.', {
					args: connection.label,
				} ) }
				<NoticeAction onClick={ this.props.onRefresh }>
					Reconnect <Gridicon icon="external" size={ 18 } />
				</NoticeAction>
			</Notice>
		);
	};

	render() {
		const { connection, label } = this.props;

		return (
			<div className="editor-sharing__publicize-connection">
				<label>
					<FormCheckbox
						checked={ ! this.isConnectionSkipped() }
						disabled={ this.isDisabled() }
						onChange={ this.onChange }
					/>
					<span data-e2e-service={ label }>{ connection && connection.external_display }</span>
				</label>
				{ this.renderBrokenConnection() }
			</div>
		);
	}
}

export default localize( EditorSharingPublicizeConnection );
