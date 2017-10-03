/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { flow, get, includes, isEmpty, map } from 'lodash';
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import QueryPostTypes from 'components/data/query-post-types';
import PublicizeMessage from './publicize-message';
import PublicizeServices from './publicize-services';
import { publicizeConnections, jetpackModules } from 'lib/paths';
import PostMetadata from 'lib/post-metadata';
import PopupMonitor from 'lib/popup-monitor';
import Button from 'components/button';
import siteUtils from 'lib/site/utils';
import { recordStat, recordEvent } from 'lib/posts/stats';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { isJetpackModuleActive } from 'state/sites/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import { postTypeSupports } from 'state/post-types/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getSiteUserConnections } from 'state/sharing/publicize/selectors';
import { fetchConnections as requestConnections } from 'state/sharing/publicize/actions';

class EditorSharingPublicizeOptions extends Component {

	static propTypes = {
		site: PropTypes.object,
		post: PropTypes.object,
		siteId: PropTypes.number,
		isPublicizeEnabled: PropTypes.bool,
		connections: PropTypes.array,
		requestConnections: PropTypes.func,
	};

	connectionPopupMonitor = false;
	jetpackModulePopupMonitor = false;

	hasConnections() {
		return ! isEmpty( this.props.connections );
	}

	componentWillUnmount() {
		if ( this.connectionPopupMonitor ) {
			this.connectionPopupMonitor.off( 'close', this.onNewConnectionPopupClosed );
		}

		if ( this.jetpackModulePopupMonitor ) {
			this.jetpackModulePopupMonitor.off( 'close', this.onModuleConnectionPopupClosed );
		}
	}

	newConnectionPopup() {
		if ( ! this.props.site ) {
			return;
		}

		const href = publicizeConnections( this.props.site );

		if ( ! this.connectionPopupMonitor ) {
			this.connectionPopupMonitor = new PopupMonitor();
		}

		this.connectionPopupMonitor.open( href );
		this.connectionPopupMonitor.once( 'close', this.onNewConnectionPopupClosed );
	}

	onNewConnectionPopupClosed = () => {
		this.props.requestConnections( this.props.site.ID );
	}

	newConnection = () => {
		this.newConnectionPopup();
		recordStat( 'sharing_create_service' );
		recordEvent( 'Opened Create New Sharing Service Dialog' );
	}

	jetpackModulePopup = () => {
		if ( ! this.props.site || ! this.props.site.jetpack ) {
			return;
		}

		const href = jetpackModules( this.props.site, 'publicize' );

		if ( ! this.jetpackModulePopupMonitor ) {
			this.jetpackModulePopupMonitor = new PopupMonitor();
		}

		this.jetpackModulePopupMonitor.open( href );
		this.jetpackModulePopupMonitor.once( 'close', this.onModuleConnectionPopupClosed );
	}

	onModuleConnectionPopupClosed = () => {
		if ( ! this.props.site || ! this.props.site.jetpack ) {
			return;
		}

		// Refresh the list of connections so that the user is given the latest
		// possible state.  Also prevents a possible infinite loading state due
		// to connections previously returning a 400 error
		this.props.site.once( 'change', () => {
			if ( this.props.isPublicizeEnabled ) {
				this.props.requestConnections( this.props.site.ID );
			}
		} );
	}

	renderServices() {
		if ( ! this.props.site || ! this.hasConnections() ) {
			return;
		}

		return (
			<PublicizeServices
				post={ this.props.post }
				newConnectionPopup={ this.newConnectionPopup }
			/>
		);
	}

	renderMessage() {
		const hasConnections = this.hasConnections();

		if ( ! hasConnections ) {
			return;
		}

		const skipped = PostMetadata.publicizeSkipped( this.props.post );
		const targeted = this.props.connections.filter( ( connection ) =>
			includes( skipped, connection.keyring_connection_ID )
		);
		const requireCount = includes( map( targeted, 'service' ), 'twitter' );
		const acceptableLength = requireCount ? 140 - 23 - 23 : null;

		return (
			<PublicizeMessage
				message={ PostMetadata.publicizeMessage( this.props.post ) || '' }
				requireCount={ requireCount }
				acceptableLength={ acceptableLength }
			/>
		);
	}

	renderAddNewButton() {
		const { site, translate } = this.props;
		// contributors cannot create publicize connections
		if ( ! siteUtils.userCan( 'publish_posts', site ) ) {
			return;
		}

		return (
			<Button borderless compact onClick={ this.newConnection }>
				<Gridicon icon="add" /> { translate( 'Connect new service' ) }
				<span className="editor-sharing__external-link-indicator">
					<Gridicon icon="external" size={ 18 } />
				</span>
			</Button>
		);
	}

	renderInfoNotice() {
		const { site, translate } = this.props;
		// don't show the message if the are no connections
		// and the user is not allowed to add any
		if ( ! this.hasConnections() && ! siteUtils.userCan( 'publish_posts', site ) ) {
			return;
		}

		return (
			<p className="editor-drawer__description">
				{ translate( 'Connect and select social media services to automatically share this post.' ) }
			</p>
		);
	}

	dismissRepublicizeMessage() {
		this.props.dismissShareConfirmation( this.props.siteId, this.props.post.ID );
	}

	render() {
		const { isPublicizeEnabled, site, siteId, translate } = this.props;

		if ( ! isPublicizeEnabled ) {
			return null;
		}

		if ( get( site, 'options.publicize_permanently_disabled' ) ) {
			return (
				<div className="editor-sharing__publicize-disabled">
					<p><span>{ translate( 'Publicize is disabled on this site.' ) }</span></p>
				</div>
			);
		}

		if ( get( site, 'jetpack' ) && ! isPublicizeEnabled ) {
			return (
				<div className="editor-sharing__publicize-disabled">
					<p><span>{ translate( 'Enable the Publicize module to automatically share new posts to social networks.' ) }</span></p>
					<button
							className="editor-sharing__jetpack-modules-button button is-secondary"
							onClick={ this.jetpackModulePopup } >
						{ translate( 'View Module Settings' ) }
					</button>
				</div>
			);
		}

		const classes = classNames( 'editor-sharing__publicize-options', {
			'has-connections': this.hasConnections(),
			'has-add-option': siteUtils.userCan( 'publish_posts', site )
		} );

		return (
			<div className={ classes }>
				{ siteId && <QueryPostTypes siteId={ siteId } /> }
				{ this.renderInfoNotice() }
				{ this.renderServices() }
				{ this.renderAddNewButton() }
				{ this.renderMessage() }
			</div>
		);
	}
}

const enhance = flow(
	localize,
	connect(
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
				connections: getSiteUserConnections( state, siteId, userId )
			};
		},
		{ requestConnections }
	)
);

export default enhance( EditorSharingPublicizeOptions );
