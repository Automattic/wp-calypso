/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';
import { includes } from 'lodash';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import FormCheckbox from 'components/forms/form-checkbox';
import PostMetadata from 'lib/post-metadata';
import { addSiteFragment } from 'lib/route';
import { recordEditorStat, recordEditorEvent } from 'state/posts/stats';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { updatePostMetadata, deletePostMetadata } from 'state/posts/actions';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPost } from 'state/posts/selectors';
import {
	getKeyringConnectionById,
	isKeyringConnectionsFetching,
} from 'state/sharing/keyring/selectors';
import QueryKeyringConnections from 'components/data/query-keyring-connections';
import { localizeUrl } from 'lib/i18n-utils';

export class EditorSharingPublicizeConnection extends React.Component {
	static propTypes = {
		post: PropTypes.object,
		connection: PropTypes.object,
		onRefresh: PropTypes.func,
		label: PropTypes.string,
		siteSlug: PropTypes.string,
	};

	static defaultProps = {
		onRefresh: () => {},
	};

	isConnectionSkipped = () => {
		const { post, connection } = this.props;
		return (
			( post &&
				connection &&
				includes( PostMetadata.publicizeSkipped( post ), connection.keyring_connection_ID ) ) ||
			( connection.service === 'facebook' && ! this.isAdditionalExternalUser( connection ) )
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
		return (
			! connection ||
			connection.read_only ||
			( connection.service === 'facebook' && ! this.isAdditionalExternalUser( connection ) ) ||
			( 'linkedin' === connection.service && 'must_reauth' === connection.status )
		);
	};

	onChange = ( event ) => {
		const { connection } = this.props;
		if ( ! connection ) {
			return;
		}

		if ( event.target.checked ) {
			this.props.deletePostMetadata(
				this.props.siteId,
				this.props.postId,
				'_wpas_skip_' + connection.keyring_connection_ID
			);
			this.props.recordEditorStat( 'sharing_enabled_' + connection.service );
			this.props.recordEditorEvent( 'Publicize Service', connection.service, 'enabled' );
		} else {
			this.props.updatePostMetadata(
				this.props.siteId,
				this.props.postId,
				'_wpas_skip_' + connection.keyring_connection_ID,
				1
			);
			this.props.recordEditorStat( 'sharing_disabled_' + connection.service );
			this.props.recordEditorEvent( 'Publicize Service', connection.service, 'disabled' );
		}
	};

	isAdditionalExternalUser( connection ) {
		const { keyringConnection } = this.props;

		if ( ! keyringConnection ) return false;

		return keyringConnection.external_ID !== connection.external_ID;
	}

	renderFacebookProfileWarning = () => {
		const { connection, isKeyringFetching } = this.props;
		if (
			! connection ||
			connection.service !== 'facebook' ||
			isKeyringFetching ||
			this.isAdditionalExternalUser( connection )
		) {
			return;
		}

		return (
			<Notice
				isCompact
				className="editor-sharing__broken-publicize-connection"
				status="is-error"
				showDismiss={ false }
			>
				{ this.props.translate(
					'Connections to Facebook profiles ceased to work on August 1st. ' +
						'{{a}}Learn More{{/a}}',
					{
						components: {
							a: (
								<a
									href={ localizeUrl( 'https://wordpress.com/support/publicize/#facebook-pages' ) }
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
						},
					}
				) }
			</Notice>
		);
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

	/**
	 * If a connection needs reauthentication, display a warning linked to Sharing settings page so users can disconnect and reconnect.
	 *
	 * @returns {object|?null} Warning about connection.
	 */
	renderMustReauthConnection = () => {
		const { connection, siteSlug } = this.props;
		if ( ! connection || connection.status !== 'must_reauth' ) {
			return null;
		}

		return (
			<Notice
				isCompact
				className="editor-sharing__must-reauth-publicize-connection"
				status="is-warning"
				showDismiss={ false }
			>
				{ this.props.translate(
					'Your LinkedIn connection needs to be reauthenticated to continue working – head to Sharing to take care of it.'
				) }
				<NoticeAction href={ addSiteFragment( '/sharing', siteSlug ) }>
					{ this.props.translate( 'Go to Sharing settings' ) }{ ' ' }
					<Gridicon icon="external" size={ 18 } />
				</NoticeAction>
			</Notice>
		);
	};

	render() {
		const { connection, label } = this.props;

		return (
			<div className="editor-sharing__publicize-connection">
				<QueryKeyringConnections />
				<label>
					<FormCheckbox
						checked={ ! this.isConnectionSkipped() }
						disabled={ this.isDisabled() }
						onChange={ this.onChange }
					/>
					<span data-e2e-service={ label }>{ connection && connection.external_display }</span>
				</label>
				{ this.renderFacebookProfileWarning() }
				{ this.renderBrokenConnection() }
				{ this.renderMustReauthConnection() }
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );

		return {
			siteId,
			postId,
			post: getEditedPost( state, siteId, postId ),
			isKeyringFetching: isKeyringConnectionsFetching( state ),
			keyringConnection: ownProps.connection
				? getKeyringConnectionById( state, ownProps.connection.keyring_connection_ID )
				: null,
			siteSlug: getSiteSlug( state, siteId ),
		};
	},
	{ updatePostMetadata, deletePostMetadata, recordEditorStat, recordEditorEvent }
)( localize( EditorSharingPublicizeConnection ) );
