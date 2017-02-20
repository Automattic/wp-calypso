/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { includes, map } from 'lodash';
import SocialLogo from 'social-logos';

/**
 * Internal dependencies
 */
import QueryPostTypes from 'components/data/query-post-types';
import Button from 'components/button';
import { isPublicizeEnabled } from 'state/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getSiteUserConnections, hasFetchedConnections } from 'state/sharing/publicize/selectors';
import { fetchConnections as requestConnections, sharePost, dismissShareConfirmation } from 'state/sharing/publicize/actions';
import { isRequestingSharePost, sharePostFailure, sharePostSuccessMessage } from 'state/sharing/publicize/selectors';
import PostMetadata from 'lib/post-metadata';
import PublicizeMessage from 'post-editor/editor-sharing/publicize-message';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import QueryPublicizeConnections from 'components/data/query-publicize-connections';
import FormToggle from 'components/forms/form-toggle/compact';
import { hasFeature } from 'state/sites/plans/selectors';
import { FEATURE_REPUBLICIZE } from 'lib/plans/constants';
import Banner from 'components/banner';

const PostSharing = React.createClass( {
	propTypes: {
		siteSlug: PropTypes.string,
		site: PropTypes.object,
		post: PropTypes.object,
		siteId: PropTypes.number,
		isPublicizeEnabled: PropTypes.bool,
		connections: PropTypes.array,
		hasFetchedConnections: PropTypes.bool,
		requestConnections: PropTypes.func
	},

	getInitialState() {
		return {
			skipped: PostMetadata.publicizeSkipped( this.props.post ) || [],
			message: PostMetadata.publicizeMessage( this.props.post ) || this.props.post.title
		}
	},

	hasConnections: function() {
		return !! ( this.props.connections && this.props.connections.length );
	},

	toggleConnection: function ( id ) {
		const skipped = this.state.skipped.slice();
		const index = skipped.indexOf( id );
		if ( index !== -1 ) {
			skipped.splice( index, 1 );
		} else {
			skipped.push( id );
		}
		this.setState( { skipped } );
	},

	isConnectionActive: function( connection ) {
		return (
			connection.status !== 'broken' &&
			this.state.skipped.indexOf( connection.keyring_connection_ID ) === -1
		);
	},

	renderServices: function() {
		if ( ! this.props.site || ! this.hasConnections() ) {
			return;
		}
		return this.props.connections.map(
			connection => <div
				key={ connection.keyring_connection_ID }
				onClick={ () => this.toggleConnection( connection.keyring_connection_ID ) }
				className={ classNames( {
					'posts__post-share-service': true,
					[ connection.service ]: true,
					'is-active': this.isConnectionActive( connection ),
					'is-broken': connection.status === 'broken'
				} ) }
			>
				<FormToggle checked={ this.isConnectionActive( connection ) }/>
				<SocialLogo icon={ connection.service === 'google_plus' ? 'google-plus' : connection.service }/>
				<div className="posts__post-share-service-account-name">
					<span>{ connection && connection.external_display }</span>
				</div>
			</div>,
			this
		);
	},
	renderMessage: function() {
		const targeted = this.hasConnections() ? this.props.connections.filter( this.isConnectionActive ) : [];
		const requireCount = includes( map( targeted, 'service' ), 'twitter' );
		const acceptableLength = ( requireCount ) ? 140 - 23 - 23 : null;

		if ( ! this.hasConnections() ) {
			return;
		}

		return (
			<PublicizeMessage
				message={ this.state.message }
				preview={ this.props.post.title }
				requireCount={ requireCount }
				onChange={ message => this.setState( { message } ) }
				acceptableLength={ acceptableLength } />
		);
	},
	dismiss: function() {
		this.props.dismissShareConfirmation( this.props.siteId, this.props.post.ID );
	},
	sharePost: function() {
		this.props.sharePost( this.props.siteId, this.props.post.ID, this.state.skipped, this.state.message );
	},
	isButtonDisabled() {
		if ( this.props.requesting ) {
			return true;
		}

		return this.props.connections.filter( this.isConnectionActive ).length < 1;
	},
	render: function() {
		if ( ! this.props.isPublicizeEnabled ) {
			return null;
		}

		const classes = classNames( 'posts__post-share', {
			'has-connections': this.hasConnections()
		} );

		if ( ! this.props.planHasRepublicizeFeature ) {
			return ( <div className="posts__post-share-wrapper">
				<Banner
					feature="republicize"
					title={ this.translate( 'Unlock the ability to re-share posts to social media' ) }
					callToAction={ this.translate( 'Upgrade to Premium' ) }
					description={ this.translate( 'Get unlimited premium themes, video uploads, monetize your site and more.' ) }
				/>
			</div> );
		}

		return (
			<div className="posts__post-share-wrapper">
				{ this.props.requesting && <Notice status="is-warning" showDismiss={ false }>{ this.translate( 'Sharing...' ) }</Notice> }
				{ this.props.success && <Notice status="is-success" onDismissClick={ this.dismiss }>{ this.translate( `Post shared. Please check your social media accounts.` ) }</Notice> }
				{ this.props.failure && <Notice status="is-error" onDismissClick={ this.dismiss }>{ this.translate( `Something went wrong. Please don't be mad.` ) }</Notice> }
				<div className={ classes }>
					{ this.props.siteId && <QueryPostTypes siteId={ this.props.siteId } /> }
					<div className="posts__post-share-head">
						<h4 className="posts__post-share-title">
							{ this.translate( 'Share post' ) }
						</h4>
						<div className="posts__post-share-subtitle">
							{ this.translate( 'Share your post on all of your connected social media accounts using {{a}}Publicize{{/a}}.', {
								components: {
									a: <a href={ '/sharing/' + this.props.siteSlug } />
								}
							} ) }
						</div>
					</div>
					{ ! this.props.hasFetchedConnections && <div className="posts__post-share-main">
						<div className="posts__post-share-form is-placeholder">
						</div>
						<div className="posts__post-share-services is-placeholder">
						</div>
					</div> }
					{ this.props.hasFetchedConnections && this.hasConnections() && <div>
						<div>
							{ this.props.connections
								.filter( connection => connection.status === 'broken' )
								.map( connection => <Notice
									key={ connection.keyring_connection_ID }
									status="is-warning"
									showDismiss={ false }
									text={ this.translate( 'There is an issue connecting to %s.', { args: connection.label } ) }
								>
									<NoticeAction href={ '/sharing/' + this.props.siteSlug }>
										{ this.translate( 'Reconnect' ) }
									</NoticeAction>
								</Notice> )
							}
						</div>
						<div className="posts__post-share-main">
							<div className="posts__post-share-form">
								{ this.renderMessage() }
								<Button
									className="posts__post-share-button"
									primary={ true }
									onClick={ this.sharePost }
									disabled={ this.isButtonDisabled() }
								>
									{ this.translate( 'Share post' ) }
								</Button>
							</div>
							<div className="posts__post-share-services">
								<h5 className="posts__post-share-services-header">
									{ this.translate( 'Connected services' ) }
								</h5>
								{ this.renderServices() }
								<Button href={ '/sharing/' + this.props.siteId } compact={ true } className="posts__post-share-services-add">
									{ this.translate( 'Add account' ) }
								</Button>
							</div>
						</div>
					</div> }
					{ this.props.hasFetchedConnections && ! this.hasConnections() && <Notice status="is-warning" showDismiss={ false } text={ this.translate( 'Connect an account to get started.' ) }>
						<NoticeAction href={ '/sharing/' + this.props.siteSlug }>
							{ this.translate( 'Settings' ) }
						</NoticeAction>
					</Notice> }
				</div>
				{ this.props.site && <QueryPublicizeConnections siteId={ this.props.site.ID } /> }
			</div>
		);
	}
} );

export default connect(
	( state, props ) => {
		const siteId = props.site.ID;
		const userId = getCurrentUserId( state );

		return {
			planHasRepublicizeFeature: hasFeature( state, siteId, FEATURE_REPUBLICIZE ),
			siteSlug: getSiteSlug( state, siteId ),
			siteId,
			isPublicizeEnabled: isPublicizeEnabled( state, siteId, props.post.type ),
			connections: getSiteUserConnections( state, siteId, userId ),
			hasFetchedConnections: hasFetchedConnections( state, siteId ),
			requesting: isRequestingSharePost( state, siteId, props.post.ID ),
			failed: sharePostFailure( state, siteId, props.post.ID ),
			success: sharePostSuccessMessage( state, siteId, props.post.ID )
		};
	},
	{ requestConnections, sharePost, dismissShareConfirmation }
)( PostSharing );
