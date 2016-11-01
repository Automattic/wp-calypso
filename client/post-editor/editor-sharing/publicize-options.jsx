/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { get, includes, map } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import QueryPostTypes from 'components/data/query-post-types';
import PublicizeMessage from './publicize-message';
import PublicizeServices from './publicize-services';
import * as paths from 'lib/paths';
import PostMetadata from 'lib/post-metadata';
import PopupMonitor from 'lib/popup-monitor';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import { recordStat, recordEvent } from 'lib/posts/stats';
import { getSelectedSiteId, getSelectedSite } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { isJetpackModuleActive, getSiteOption, isJetpackSite } from 'state/sites/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import { postTypeSupports } from 'state/post-types/selectors';
import { getCurrentUserId, canCurrentUser } from 'state/current-user/selectors';
import {
	getSiteUserConnections,
	isRequestingSharePost,
	sharePostFailure,
	sharePostSuccessMessage
} from 'state/sharing/publicize/selectors';
import { fetchConnections as requestConnections, sharePost, dismissShareConfirmation } from 'state/sharing/publicize/actions';
import config from 'config';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';

const EditorSharingPublicizeOptions = React.createClass( {
	connectionPopupMonitor: false,
	jetpackModulePopupMonitor: false,

	propTypes: {
		site: PropTypes.object,
		post: PropTypes.object,
		siteId: PropTypes.number,
		isPublicizeEnabled: PropTypes.bool,
		connections: PropTypes.array,
		requestConnections: PropTypes.func,
		publicizePermanentlyDisabled: PropTypes.bool,
		isJetpack: PropTypes.bool,
		userCanPublishPosts: PropTypes.bool,
	},

	hasConnections: function() {
		return this.props.connections && this.props.connections.length;
	},

	componentWillUnmount() {
		if ( this.connectionPopupMonitor ) {
			this.connectionPopupMonitor.off( 'close', this.onNewConnectionPopupClosed );
		}

		if ( this.jetpackModulePopupMonitor ) {
			this.jetpackModulePopupMonitor.off( 'close', this.onModuleConnectionPopupClosed );
		}
	},

	newConnectionPopup: function() {
		let href;

		if ( ! this.props.site ) {
			return;
		}

		href = paths.publicizeConnections( this.props.site );

		if ( ! this.connectionPopupMonitor ) {
			this.connectionPopupMonitor = new PopupMonitor();
		}

		this.connectionPopupMonitor.open( href );
		this.connectionPopupMonitor.once( 'close', this.onNewConnectionPopupClosed );
	},

	onNewConnectionPopupClosed() {
		this.props.requestConnections( this.props.siteId );
	},

	newConnection: function() {
		this.newConnectionPopup();
		recordStat( 'sharing_create_service' );
		recordEvent( 'Opened Create New Sharing Service Dialog' );
	},

	jetpackModulePopup: function() {
		if ( ! this.props.isJetpack ) {
			return;
		}

		const href = paths.jetpackModules( this.props.site, 'publicize' );

		if ( ! this.jetpackModulePopupMonitor ) {
			this.jetpackModulePopupMonitor = new PopupMonitor();
		}

		this.jetpackModulePopupMonitor.open( href );
		this.jetpackModulePopupMonitor.once( 'close', this.onModuleConnectionPopupClosed );
	},

	onModuleConnectionPopupClosed: function() {
		const { isJetpack, isPublicizeEnabled, siteId } = this.props;
		if ( ! isJetpack || ! isPublicizeEnabled ) {
			return;
		}

		// Refresh the list of connections so that the user is given the latest
		// possible state.  Also prevents a possible infinite loading state due
		// to connections previously returning a 400 error
		this.props.requestConnections( siteId );
	},

	renderServices: function() {
		if ( ! this.props.site || ! this.hasConnections() ) {
			return;
		}

		return (
			<PublicizeServices
				post={ this.props.post }
				siteId={ this.props.siteId }
				connections={ this.props.connections }
				newConnectionPopup={ this.newConnectionPopup } />
		);
	},

	renderMessage: function() {
		var preview = get( this.props.post, 'title' ),
			skipped = this.hasConnections() ? PostMetadata.publicizeSkipped( this.props.post ) : [],
			targeted = this.hasConnections() ? this.props.connections.filter( function( connection ) {
				return skipped && -1 === skipped.indexOf( connection.keyring_connection_ID );
			} ) : [],
			requireCount = includes( map( targeted, 'service' ), 'twitter' ),
			acceptableLength = ( requireCount ) ? 140 - 23 - 23 : null;

		if ( ! this.hasConnections() ) {
			return;
		}

		return (
			<PublicizeMessage
				message={ PostMetadata.publicizeMessage( this.props.post ) }
				preview={ preview }
				requireCount={ requireCount }
				acceptableLength={ acceptableLength } />
		);
	},

	renderAddNewButton: function() {
		// contributors cannot create publicize connections
		if ( ! this.props.userCanPublishPosts ) {
			return;
		}

		return (
			<Button borderless compact onClick={ this.newConnection }>
				<Gridicon icon="add" /> { this.translate( 'Connect new service' ) }
				<span className="editor-sharing__external-link-indicator">
					<Gridicon icon="external" size={ 18 } />
				</span>
			</Button>
		);
	},

	renderInfoNotice: function() {
		// don't show the message if the are no connections
		// and the user is not allowed to add any
		if ( ! this.hasConnections() && ! this.props.userCanPublishPosts ) {
			return;
		}

		return (
			<p className="editor-drawer__description">
				{ this.translate( 'Connect and select social media services to automatically share this post.' ) }
			</p>
		);
	},

	republicizePost() {
		const skipped = PostMetadata.publicizeSkipped( this.props.post );
		const message = PostMetadata.publicizeMessage( this.props.post );
		this.props.sharePost( this.props.siteId, this.props.post.ID, skipped, message );
	},

	renderRepublicize() {
		return (
			<Button
				className="button editor-sharing__publicize-share-button"
				disabled={ ( this.props.connections.length - PostMetadata.publicizeSkipped( this.props.post ).length < 1 ) || this.props.requesting }
				onClick={ this.republicizePost }
			>
				{ this.translate( 'Share' ) }
			</Button>
		);
	},
	dismissRepublicizeMessage: function() {
		this.props.dismissShareConfirmation( this.props.siteId, this.props.post.ID );
	},
	render: function() {
		const { isPublicizeEnabled, publicizePermanentlyDisabled } = this.props;
		if ( ! isPublicizeEnabled ) {
			return null;
		}

		if ( publicizePermanentlyDisabled ) {
			return (
				<div className="editor-sharing__publicize-disabled">
					<p><span>{ this.translate( 'Publicize is disabled on this site.' ) }</span></p>
				</div>
			);
		}

		const classes = classNames( 'editor-sharing__publicize-options', {
			'has-connections': this.hasConnections(),
			'has-add-option': this.props.userCanPublishPosts
		} );

		return (
			<div className={ classes }>
				{ this.props.siteId && <QueryPostTypes siteId={ this.props.siteId } /> }
				{ this.renderInfoNotice() }
				{ this.renderServices() }
				{ this.renderAddNewButton() }
				{ this.renderMessage() }
				{ this.props.requesting && <Notice isCompact status="is-warning">{ this.translate( 'Hang tight, socializing your media...' ) }</Notice> }
				{ this.props.success && <Notice isCompact status="is-success" text={ this.translate( 'It went out! Your social media is on fire!' ) }><NoticeAction onClick={ this.dismissRepublicizeMessage }>{ this.translate( 'X' ) }</NoticeAction></Notice> }
				{ this.props.failure && <Notice isCompact status="is-error" text={ this.translate( 'Something went wrong. Please dont be mad.' ) }><NoticeAction onClick={ this.dismissRepublicizeMessage }>{ this.translate( 'X' ) }</NoticeAction></Notice> }
				{
					config.isEnabled( 'republicize' ) &&
					this.props.post &&
					( this.props.post.status === 'publish' ) &&
					this.renderRepublicize()
				}
			</div>
		);
	}
} );

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const userId = getCurrentUserId( state );
		const postId = getEditorPostId( state );
		const postType = getEditedPostValue( state, siteId, postId, 'type' );
		const isPublicizeEnabled = (
			false !== isJetpackModuleActive( state, siteId, 'publicize' ) &&
			postTypeSupports( state, siteId, postType, 'publicize' )
		);

		return {
			siteId,
			isPublicizeEnabled,
			userCanPublishPosts: canCurrentUser( state, siteId, 'publish_posts' ),
			isJetpack: isJetpackSite( state, siteId ),
			publicizePermanentlyDisabled: getSiteOption( state, siteId, 'publicize_permanently_disabled' ),
			site: getSelectedSite( state ),
			connections: getSiteUserConnections( state, siteId, userId ),
			requesting: isRequestingSharePost( state, siteId, postId ),
			failed: sharePostFailure( state, siteId, postId ),
			success: sharePostSuccessMessage( state, siteId, postId )
		};
	},
	{ requestConnections, sharePost, dismissShareConfirmation }
)( EditorSharingPublicizeOptions );
