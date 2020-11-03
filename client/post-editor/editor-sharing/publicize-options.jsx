/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';
import { includes, map } from 'lodash';
import classNames from 'classnames';
import Gridicon from 'calypso/components/gridicon';
import PopupMonitor from '@automattic/popup-monitor';

/**
 * Internal dependencies
 */
import QueryPostTypes from 'calypso/components/data/query-post-types';
import PublicizeMessage from './publicize-message';
import PublicizeServices from './publicize-services';
import { publicizeConnections } from 'calypso/lib/paths';
import PostMetadata from 'calypso/lib/post-metadata';
import { Button } from '@automattic/components';
import { recordEditorStat, recordEditorEvent } from 'calypso/state/posts/stats';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getSite } from 'calypso/state/sites/selectors';
import { getEditorPostId } from 'calypso/state/editor/selectors';
import { getEditedPost, getEditedPostValue } from 'calypso/state/posts/selectors';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getSiteUserConnections } from 'calypso/state/sharing/publicize/selectors';
import { fetchConnections as requestConnections } from 'calypso/state/sharing/publicize/actions';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import isPublicizeEnabled from 'calypso/state/selectors/is-publicize-enabled';
import { updatePostMetadata } from 'calypso/state/posts/actions';

/**
 * Style dependencies
 */
import './publicize-options.scss';

class EditorSharingPublicizeOptions extends React.Component {
	static propTypes = {
		site: PropTypes.object,
		post: PropTypes.object,
		siteId: PropTypes.number,
		isPublicizeEnabled: PropTypes.bool,
		connections: PropTypes.array,
		requestConnections: PropTypes.func,
	};

	connectionPopupMonitor = false;

	hasConnections = () => {
		return this.props.connections && this.props.connections.length;
	};

	componentWillUnmount() {
		if ( this.connectionPopupMonitor ) {
			this.connectionPopupMonitor.off( 'close', this.onNewConnectionPopupClosed );
		}
	}

	newConnectionPopup = () => {
		if ( ! this.props.site ) {
			return;
		}

		const href = publicizeConnections( this.props.site );

		if ( ! this.connectionPopupMonitor ) {
			this.connectionPopupMonitor = new PopupMonitor();
		}

		this.connectionPopupMonitor.open( href );
		this.connectionPopupMonitor.once( 'close', this.onNewConnectionPopupClosed );
	};

	onNewConnectionPopupClosed = () => {
		this.props.requestConnections( this.props.site.ID );
	};

	newConnection = () => {
		this.newConnectionPopup();
		this.props.recordEditorStat( 'sharing_create_service' );
		this.props.recordEditorEvent( 'Opened Create New Sharing Service Dialog' );
	};

	renderServices = () => {
		if ( ! this.props.site || ! this.hasConnections() ) {
			return;
		}

		return <PublicizeServices newConnectionPopup={ this.newConnectionPopup } />;
	};

	renderMessage = () => {
		const skipped = this.hasConnections() ? PostMetadata.publicizeSkipped( this.props.post ) : [],
			targeted = this.hasConnections()
				? this.props.connections.filter(
						( connection ) => skipped && -1 === skipped.indexOf( connection.keyring_connection_ID )
				  )
				: [],
			requireCount = includes( map( targeted, 'service' ), 'twitter' ),
			acceptableLength = requireCount ? 280 - 23 - 23 : null,
			preFilledMessage = this.props.post ? this.props.post.title : '';

		if ( ! this.hasConnections() ) {
			return;
		}

		return (
			<PublicizeMessage
				message={ PostMetadata.publicizeMessage( this.props.post ) || '' }
				onChange={ this.onMessageChange }
				requireCount={ requireCount }
				acceptableLength={ acceptableLength }
				preFilledMessage={ preFilledMessage }
			/>
		);
	};

	onMessageChange = ( message ) => {
		this.props.updatePostMetadata( this.props.siteId, this.props.postId, '_wpas_mess', message );
	};

	renderAddNewButton = () => {
		// contributors cannot create publicize connections
		if ( ! this.props.canUserPublishPosts ) {
			return;
		}

		return (
			<Button borderless compact onClick={ this.newConnection }>
				<Gridicon icon="add" /> { this.props.translate( 'Connect new service' ) }
				<span className="editor-sharing__external-link-indicator">
					<Gridicon icon="external" size={ 18 } />
				</span>
			</Button>
		);
	};

	renderInfoNotice = () => {
		// don't show the message if the are no connections
		// and the user is not allowed to add any
		if ( ! this.hasConnections() && ! this.props.canUserPublishPosts ) {
			return;
		}

		return (
			<p className="editor-sharing__publicize-options-description">
				{ this.props.translate(
					'Connect and select social media services to automatically share this post.'
				) }
			</p>
		);
	};

	render() {
		if ( ! this.props.isPublicizeEnabled ) {
			return null;
		}

		const classes = classNames( 'editor-sharing__publicize-options', {
			'has-connections': this.hasConnections(),
			'has-add-option': this.props.canUserPublishPosts,
		} );

		return (
			<div className={ classes }>
				{ this.props.siteId && <QueryPostTypes siteId={ this.props.siteId } /> }
				{ this.renderInfoNotice() }
				{ this.renderServices() }
				{ this.renderAddNewButton() }
				{ this.renderMessage() }
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const userId = getCurrentUserId( state );
		const postId = getEditorPostId( state );
		const site = getSite( state, siteId );
		const post = getEditedPost( state, siteId, postId );
		const postType = getEditedPostValue( state, siteId, postId, 'type' );

		const canUserPublishPosts = canCurrentUser( state, siteId, 'publish_posts' );

		return {
			siteId,
			postId,
			site,
			post,
			isPublicizeEnabled: isPublicizeEnabled( state, siteId, postType ),
			canUserPublishPosts,
			connections: getSiteUserConnections( state, siteId, userId ),
		};
	},
	{ requestConnections, updatePostMetadata, recordEditorStat, recordEditorEvent }
)( localize( EditorSharingPublicizeOptions ) );
