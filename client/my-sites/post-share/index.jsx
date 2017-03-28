/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { includes, map } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import QueryPostTypes from 'components/data/query-post-types';
import Button from 'components/button';
import ButtonGroup from 'components/button-group';
import { isPublicizeEnabled } from 'state/selectors';
import {
	getSiteSlug,
	getSitePlanSlug,
} from 'state/sites/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getSiteUserConnections, hasFetchedConnections } from 'state/sharing/publicize/selectors';
import { fetchConnections as requestConnections, sharePost, dismissShareConfirmation } from 'state/sharing/publicize/actions';
import { isRequestingSharePost, sharePostFailure, sharePostSuccessMessage } from 'state/sharing/publicize/selectors';
import PostMetadata from 'lib/post-metadata';
import PublicizeMessage from 'post-editor/editor-sharing/publicize-message';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import QueryPublicizeConnections from 'components/data/query-publicize-connections';
import { hasFeature } from 'state/sites/plans/selectors';
import {
	FEATURE_REPUBLICIZE,
	PLAN_BUSINESS,
} from 'lib/plans/constants';
import Banner from 'components/banner';
import Connection from './connection';
import { isEnabled } from 'config';
import CalendarButton from 'blocks/calendar-button';

class PostShare extends Component {
	static propTypes = {
		siteSlug: PropTypes.string,
		site: PropTypes.object,
		post: PropTypes.object,
		planSlug: PropTypes.string,
		siteId: PropTypes.number,
		isPublicizeEnabled: PropTypes.bool,
		connections: PropTypes.array,
		hasFetchedConnections: PropTypes.bool,
		requestConnections: PropTypes.func,
	};

	state = {
		message: PostMetadata.publicizeMessage( this.props.post ) || this.props.post.title,
		skipped: PostMetadata.publicizeSkipped( this.props.post ) || [],
	};

	hasConnections() {
		return !! ( this.props.connections && this.props.connections.length );
	}

	isSchedulingEnabled() {
		const { planSlug } = this.props;
		return planSlug === PLAN_BUSINESS && isEnabled( 'publicize-scheduling' );
	}

	toggleConnection = id => {
		const skipped = this.state.skipped.slice();
		const index = skipped.indexOf( id );
		if ( index !== -1 ) {
			skipped.splice( index, 1 );
		} else {
			skipped.push( id );
		}

		this.setState( { skipped } );
	};

	skipConnection( { keyring_connection_ID } ) {
		return this.state.skipped.indexOf( keyring_connection_ID ) === -1;
	}

	isConnectionActive = connection => connection.status !== 'broken' && this.skipConnection( connection );

	renderServices() {
		if ( ! this.props.site || ! this.hasConnections() ) {
			return;
		}

		return this.props.connections.map( connection =>
			<Connection
				connection={ connection }
				onToggle= { this.toggleConnection }
				isActive={ this.isConnectionActive( connection ) }
				key={ connection.keyring_connection_ID }
			/>
		);
	}

	setMessage = message => this.setState( { message } );

	dismiss = () => {
		this.props.dismissShareConfirmation( this.props.siteId, this.props.post.ID );
	};

	sharePost = () => {
		this.props.sharePost( this.props.siteId, this.props.post.ID, this.state.skipped, this.state.message );
	};

	isButtonDisabled() {
		if ( this.props.requesting ) {
			return true;
		}

		return this.props.connections.filter( this.isConnectionActive ).length < 1;
	}

	previewSharingPost = () => {
	}

	renderMessage() {
		if ( ! this.hasConnections() ) {
			return;
		}

		const targeted = this.hasConnections() ? this.props.connections.filter( this.isConnectionActive ) : [];
		const requireCount = includes( map( targeted, 'service' ), 'twitter' );
		const acceptableLength = ( requireCount ) ? 140 - 23 - 23 : null;

		return (
			<PublicizeMessage
				message={ this.state.message }
				preview={ this.props.post.title }
				requireCount={ requireCount }
				onChange={ this.setMessage }
				acceptableLength={ acceptableLength } />
		);
	}

	renderShareButton() {
		const { siteId, translate } = this.props;
		return (
			<div className="post-share__button-actions">
				<Button onClick={ this.previewSharingPost }>
					{ translate( 'Preview' ) }
				</Button>

				<ButtonGroup className="post-share__share-combo">
					<Button
						className="post-share__button"
						primary
						onClick={ this.sharePost }
						disabled={ this.isButtonDisabled() }
					>
						{ translate( 'Share post' ) }
					</Button>

					<CalendarButton
						primary
						className="post-share__schedule-button"
						title={ translate( 'Set date and time' ) }
						tabIndex={ 3 }
						siteId={ siteId }
						popoverPosition="bottom left" />
				</ButtonGroup>
			</div>
		);
	}

	render() {
		if ( ! this.props.isPublicizeEnabled ) {
			return null;
		}

		if ( ! this.props.planHasRepublicizeFeature ) {
			return ( <div className="post-share">
				<Banner
					feature="republicize"
					title={ this.props.translate( 'Unlock the ability to re-share posts to social media' ) }
					callToAction={ this.props.translate( 'Upgrade to Premium' ) }
					description={ this.props.translate( 'Get unlimited premium themes, video uploads, monetize your site and more.' ) }
				/>
			</div> );
		}

		const classes = classNames( 'post-share__wrapper', {
			'has-connections': this.hasConnections()
		} );

		return (
			<div className="post-share">
				{ this.props.requesting &&
					<Notice status="is-warning" showDismiss={ false }>
							{ this.props.translate( 'Sharing…' ) }
					</Notice>
				}

				{ this.props.success &&
					<Notice status="is-success" onDismissClick={ this.dismiss }>
						{ this.props.translate( 'Post shared. Please check your social media accounts.' ) }
					</Notice>
				}

				{ this.props.failure &&
					<Notice status="is-error" onDismissClick={ this.dismiss }>
						{ this.props.translate( 'Something went wrong. Please don\'t be mad.' ) }
						</Notice>
				}

				<div className={ classes }>
					{ this.props.siteId && <QueryPostTypes siteId={ this.props.siteId } /> }
					<div className="post-share__head">
						<h4 className="post-share__title">
							{ this.props.translate( 'Share this post' ) }
						</h4>
						<div className="post-share__subtitle">
							{ this.props.translate(
								'Share your post on all of your connected social media accounts using ' +
								'{{a}}Publicize{{/a}}.', {
									components: {
										a: <a href={ '/sharing/' + this.props.siteSlug } />
									}
								}
							) }
						</div>
					</div>

					{ ! this.props.hasFetchedConnections &&
						<div className="post-share__main">
							<div className="post-share__form is-placeholder" />
							<div className="post-share__services is-placeholder" />
						</div>
					}

					{ this.props.hasFetchedConnections && this.hasConnections() &&
						<div>
							<div>
								{ this.props.connections
									.filter( connection => connection.status === 'broken' )
									.map( connection => <Notice
										key={ connection.keyring_connection_ID }
										status="is-warning"
										showDismiss={ false }
										text={ this.props.translate( 'There is an issue connecting to %s.', { args: connection.label } ) }
									>
										<NoticeAction href={ '/sharing/' + this.props.siteSlug }>
											{ this.props.translate( 'Reconnect' ) }
										</NoticeAction>
									</Notice> )
								}
							</div>

							<div className="post-share__main">
								<div className="post-share__form">
									{ this.renderMessage() }
									{ this.renderShareButton() }
								</div>

								<div className="post-share__services">
									<h5 className="post-share__services-header">
										{ this.props.translate( 'Connected services' ) }
									</h5>
									{ this.renderServices() }
									<Button
										href={ '/sharing/' + this.props.siteId }
										compact={ true }
										className="post-share__services-add"
									>
										{ this.props.translate( 'Add account' ) }
									</Button>
								</div>
							</div>
						</div>
					}

					{ this.props.hasFetchedConnections && ! this.hasConnections() &&
						<Notice
							status="is-warning"
							showDismiss={ false }
							text={ this.props.translate( 'Connect an account to get started.' ) }
						>
							<NoticeAction href={ '/sharing/' + this.props.siteSlug }>
								{ this.props.translate( 'Settings' ) }
							</NoticeAction>
						</Notice>
					}
				</div>

				{ this.props.site && <QueryPublicizeConnections siteId={ this.props.site.ID } /> }
			</div>
		);
	}
}

export default connect(
	( state, props ) => {
		const siteId = props.site.ID;
		const userId = getCurrentUserId( state );

		return {
			planHasRepublicizeFeature: hasFeature( state, siteId, FEATURE_REPUBLICIZE ),
			siteSlug: getSiteSlug( state, siteId ),
			planSlug: getSitePlanSlug( state, siteId ),
			siteId,
			isPublicizeEnabled: isPublicizeEnabled( state, siteId, props.post.type ),
			connections: getSiteUserConnections( state, siteId, userId ),
			hasFetchedConnections: hasFetchedConnections( state, siteId ),
			requesting: isRequestingSharePost( state, siteId, props.post.ID ),
			failed: sharePostFailure( state, siteId, props.post.ID ),
			success: sharePostSuccessMessage( state, siteId, props.post.ID ),
		};
	},
	{ requestConnections, sharePost, dismissShareConfirmation }
)( localize( PostShare ) );
