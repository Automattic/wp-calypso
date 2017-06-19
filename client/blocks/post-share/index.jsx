/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { get, includes, map } from 'lodash';
import { localize } from 'i18n-calypso';
import { isEnabled } from 'config';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import QueryPostTypes from 'components/data/query-post-types';
import QueryPosts from 'components/data/query-posts';
import QueryPublicizeConnections from 'components/data/query-publicize-connections';
import Button from 'components/button';
import ButtonGroup from 'components/button-group';
import NoticeAction from 'components/notice/notice-action';
import {
	isPublicizeEnabled,
	isSchedulingPublicizeShareAction,
	getScheduledPublicizeShareActionTime,
	isSchedulingPublicizeShareActionError,
} from 'state/selectors';
import {
	getSiteSlug,
	getSitePlanSlug,
	isJetpackSite,
} from 'state/sites/selectors';
import { getCurrentUserId, getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import {
	getSiteUserConnections,
	hasFetchedConnections as siteHasFetchedConnections,
} from 'state/sharing/publicize/selectors';

import {
	fetchConnections as requestConnections,
	sharePost,
	dismissShareConfirmation,
} from 'state/sharing/publicize/actions';
import { schedulePostShareAction } from 'state/sharing/publicize/publicize-actions/actions';
import { isRequestingSharePost, sharePostFailure, sharePostSuccessMessage } from 'state/sharing/publicize/selectors';
import PostMetadata from 'lib/post-metadata';
import PublicizeMessage from 'post-editor/editor-sharing/publicize-message';
import Notice from 'components/notice';
import {
	hasFeature,
	getSitePlanRawPrice,
	getPlanDiscountedRawPrice,
} from 'state/sites/plans/selectors';
import {
	FEATURE_REPUBLICIZE,
	FEATURE_REPUBLICIZE_SCHEDULING,
	PLAN_BUSINESS,
} from 'lib/plans/constants';
import Banner from 'components/banner';

import SharingPreviewModal from './sharing-preview-modal';
import ConnectionsList, { NoConnectionsNotice } from './connections-list';

import ActionsList from './publicize-actions-list';
import CalendarButton from 'blocks/calendar-button';

import SectionHeader from 'components/section-header';
import Tooltip from 'components/tooltip';
import analytics from 'lib/analytics';
import TrackComponentView from 'lib/analytics/track-component-view';

class PostShare extends Component {
	static propTypes = {
		// parent prps
		post: PropTypes.object,
		siteId: PropTypes.number,
		disabled: PropTypes.bool,

		// connect prps
		businessDiscountedRawPrice: PropTypes.number,
		businessRawPrice: PropTypes.number,
		connections: PropTypes.array,
		failed: PropTypes.bool,
		hasFetchedConnections: PropTypes.bool,
		hasRepublicizeFeature: PropTypes.bool,
		hasRepublicizeSchedulingFeature: PropTypes.bool,
		isPublicizeEnabled: PropTypes.bool,
		planSlug: PropTypes.string,
		postId: PropTypes.number,
		requestConnections: PropTypes.func,
		requesting: PropTypes.bool,
		siteSlug: PropTypes.string,
		success: PropTypes.bool,
		userCurrency: PropTypes.string,
	};

	static defaultProps = {
		connections: [],
		disabled: false,
		post: {},
	};

	state = {
		message: PostMetadata.publicizeMessage( this.props.post ) || this.props.post.title,
		skipped: PostMetadata.publicizeSkipped( this.props.post ) || [],
		showSharingPreview: false,
		showAccountTooltip: false,
		scheduledDate: null,
	};

	hasConnections() {
		return !! get( this.props, 'connections.length' );
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

	scheduleDate = date => {
		if ( date.isBefore( Date.now() ) ) {
			date = null;
		}
		this.setState( { scheduledDate: date } );
	};

	skipConnection( { keyring_connection_ID } ) {
		return this.state.skipped.indexOf( keyring_connection_ID ) === -1;
	}

	isConnectionActive = connection => connection.status !== 'broken' && this.skipConnection( connection );

	activeConnections() {
		return this.props.connections.filter( this.isConnectionActive );
	}

	toggleSharingPreview = () => {
		const showSharingPreview = ! this.state.showSharingPreview;

		if ( showSharingPreview ) {
			document.documentElement.classList.add( 'no-scroll', 'is-previewing' );
		} else {
			document.documentElement.classList.remove( 'no-scroll', 'is-previewing' );
		}

		analytics.tracks.recordEvent( 'calypso_publicize_share_preview_toggle', { show: showSharingPreview } );
		this.setState( { showSharingPreview } );
	}

	setMessage = message => this.setState( { message } );

	dismiss = () => {
		this.props.dismissShareConfirmation( this.props.siteId, this.props.postId );
	};

	sharePost = () => {
		const {
			postId,
			siteId,
			connections,
		} = this.props;
		const servicesToPublish = connections
			.filter( connection => this.state.skipped.indexOf( connection.keyring_connection_ID ) === -1 );
		//Let's prepare array of service stats for tracks.
		const numberOfAccountsPerService = servicesToPublish.reduce( ( counts, service ) => {
			counts.service_all = counts.service_all + 1;
			if ( ! counts[ 'service_' + service.service ] ) {
				counts[ 'service_' + service.service ] = 0;
			}
			counts[ 'service_' + service.service ] = counts[ 'service_' + service.service ] + 1;
			return counts;
		}, { service_all: 0 } );

		if ( this.state.scheduledDate ) {
			analytics.tracks.recordEvent( 'calypso_publicize_share_schedule', numberOfAccountsPerService );

			this.props.schedulePostShareAction(
				siteId,
				postId,
				this.state.message,
				this.state.scheduledDate.format( 'X' ),
				servicesToPublish.map( connection => connection.ID ),
			);
		} else {
			analytics.tracks.recordEvent( 'calypso_publicize_share_instantly', numberOfAccountsPerService );
			this.props.sharePost( siteId, postId, this.state.skipped, this.state.message );
		}
	};

	isDisabled() {
		if (
			this.props.disabled ||
			this.props.requesting ||
			this.activeConnections().length < 1
		) {
			return true;
		}
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
				disabled={ this.isDisabled() }
				message={ this.state.message }
				preview={ this.props.post.title }
				requireCount={ requireCount }
				onChange={ this.setMessage }
				acceptableLength={ acceptableLength } />
		);
	}

	renderSharingButtons() {
		const {
			hasRepublicizeSchedulingFeature,
			siteId,
			translate,
		} = this.props;

		const shareButton = <Button
			className="post-share__share-button"
			primary
			onClick={ this.sharePost }
			disabled={ this.isDisabled() }
		>
			{ this.state.scheduledDate ? translate( 'Schedule post' ) : translate( 'Share post' ) }
		</Button>;

		const previewButton = isEnabled( 'publicize-preview' ) &&
			<Button
				disabled={ this.isDisabled() }
				className="post-share__preview-button"
				onClick={ this.toggleSharingPreview }
			>
				{ translate( 'Preview' ) }
			</Button>;

		if ( ! hasRepublicizeSchedulingFeature ) {
			return (
				<div className="post-share__button-actions">
					{ previewButton }
					{ shareButton }
				</div>
			);
		}

		return (
			<div className="post-share__button-actions">
				{ previewButton }

				<ButtonGroup
					className="post-share__share-combo"
					primary
					busy={ this.props.requesting }
					disabled={ this.isDisabled() }
				>
					{ shareButton }

					<CalendarButton
						primary
						className="post-share__schedule-button"
						disabled={ this.isDisabled() }
						title={ translate( 'Set date and time' ) }
						selectedDay={ this.state.scheduledDate }
						tabIndex={ 3 }
						siteId={ siteId }
						onDateChange={ this.scheduleDate }
						popoverPosition="bottom left" />
				</ButtonGroup>
			</div>
		);
	}

	renderConnectionsWarning() {
		const {
			connections,
			hasFetchedConnections,
			siteSlug,
			translate,
		} = this.props;

		if ( ! hasFetchedConnections || ! connections.length ) {
			return null;
		}

		const brokenConnections = connections.filter( connection => connection.status === 'broken' );

		if ( ! brokenConnections.length ) {
			return null;
		}

		return (
			<div>
				{ brokenConnections
					.map( connection => <Notice
						key={ connection.keyring_connection_ID }
						status="is-warning"
						showDismiss={ false }
						text={ translate( 'There is an issue connecting to %s.', { args: connection.label } ) }
					>
						<NoticeAction href={ `/sharing/${ siteSlug }` }>
							{ translate( 'Reconnect' ) }
						</NoticeAction>
					</Notice> )
				}
			</div>
		);
	}

	renderRequestSharingNotice() {
		const {
			failure,
			requesting,
			success,
			translate,
		} = this.props;

		if ( this.props.scheduling ) {
			return (
				<Notice status="is-warning" showDismiss={ false }>
					{ translate( 'We are writing your shares to the calendar…' ) }
				</Notice>
			);
		}
		if ( this.props.scheduledAt ) {
			return (
				<Notice status="is-success" onDismissClick={ this.dismiss }>
					{ translate( 'We`ll share your post on %s.', {
						args: this.props.scheduledAt.format( 'ddd, MMMM Do YYYY, h:mm:ss a' )
					} ) }
				</Notice>
			);
		}

		if ( this.props.schedulingFailed ) {
			return (
				<Notice status="is-error" onDismissClick={ this.dismiss }>
					{ translate( 'Scheduling share failed. Please don\'t be mad.' ) }
				</Notice>
			);
		}

		if ( requesting ) {
			return (
				<Notice status="is-warning" showDismiss={ false }>
						{ translate( 'Sharing…' ) }
				</Notice>
			);
		}

		if ( success ) {
			return (
				<Notice status="is-success" onDismissClick={ this.dismiss }>
					{ translate( 'Post shared. Please check your social media accounts.' ) }
				</Notice>
			);
		}

		if ( failure ) {
			return (
				<Notice status="is-error" onDismissClick={ this.dismiss }>
					{ translate( 'Something went wrong. Please don\'t be mad.' ) }
				</Notice>
			);
		}
	}

	showAddTooltip = () => this.setState( { showAccountTooltip: true } );

	hideAddTooltip = () => this.setState( { showAccountTooltip: false } );

	renderConnectionsSection() {
		const { hasFetchedConnections, siteId, siteSlug, translate } = this.props;

		// enrich connections
		const connections = map( this.props.connections, connection => (
			{ ...connection, isActive: this.isConnectionActive( connection ) } )
		);

		return (
			<div className="post-share__services">
				<SectionHeader className="post-share__services-header" label={ translate( 'Connected accounts' ) }>
					<Button
						compact
						href={ '/sharing/' + siteId }
						className="post-share__add-button"
						onMouseEnter={ this.showAddTooltip }
						onMouseLeave={ this.hideAddTooltip }
						ref="addAccountButton"
						aria-label={ translate( 'Add account' ) }>
						<Gridicon icon="plus-small" size={ 18 } /><Gridicon icon="user" size={ 18 } />
						<Tooltip
							isVisible={ this.state.showAccountTooltip }
							context={ this.refs && this.refs.addAccountButton }
							position="bottom">
							{ translate( 'Add account' ) }
						</Tooltip>
					</Button>
				</SectionHeader>

				<ConnectionsList { ...{
					connections,
					hasFetchedConnections,
					siteId,
					siteSlug,
				} }
					onToggle={ this.toggleConnection }
				/>
			</div>
		);
	}

	renderPrimarySection() {
		const {
			hasFetchedConnections,
			hasRepublicizeFeature,
			hasRepublicizeSchedulingFeature,
		} = this.props;

		if ( ! hasFetchedConnections ) {
			return null;
		}

		const { siteSlug, translate } = this.props;

		if ( ! this.hasConnections() ) {
			return (
				<NoConnectionsNotice { ...{
					siteSlug,
					translate,
				} } />
			);
		}

		if (
			! hasRepublicizeFeature &&
			! hasRepublicizeSchedulingFeature &&
			isEnabled( 'publicize-scheduling' )
		) {
			let description;
			if ( this.props.isJetpack ) {
				description = translate( 'Get spam protection, unlimited backup storage and more.' );
			} else {
				description = translate( 'Get unlimited premium themes, video uploads, monetize your site and more.' );
			}
			return (
				<div>
					<Banner
						className="post-share__upgrade-nudge"
						feature="republicize"
						title={ translate( 'Unlock the ability to re-share posts to social media' ) }
						callToAction={ translate( 'Upgrade to Personal' ) }
						description={ description }
					/>
					<ActionsList { ...this.props } />
				</div>
			);
		}

		return (
			<div>
				<div className="post-share__main">
					<div className="post-share__form">
						{ this.renderMessage() }
						{ this.renderSharingButtons() }
					</div>

					{ this.renderConnectionsSection() }
				</div>

				{ isEnabled( 'publicize-scheduling' ) && <ActionsList { ...this.props } /> }
			</div>
		);
	}

	render() {
		if ( ! this.props.isPublicizeEnabled ) {
			return null;
		}

		const {
			hasRepublicizeFeature,
			hasRepublicizeSchedulingFeature,
			postId,
			siteId,
			siteSlug,
			translate,
		} = this.props;

		if ( ! siteId || ! postId ) {
			return null;
		}

		const classes = classNames(
			'post-share__wrapper',
			{ 'has-connections': this.hasConnections() },
			{ 'has-republicize-feature': hasRepublicizeFeature },
			{ 'has-republicize-scheduling-feature': hasRepublicizeSchedulingFeature },
		);

		return (
			<div className="post-share">
				<TrackComponentView eventName="calypso_publicize_post_share_view" />
				<QueryPostTypes siteId={ siteId } />
				<QueryPublicizeConnections siteId={ siteId } />

				<div className={ classes }>
					<div className="post-share__head">
						<h4 className="post-share__title">
							{ translate( 'Share this post' ) }
						</h4>
						<div className="post-share__subtitle">
							{ translate(
								'Share your post on all of your connected social media accounts using ' +
								'{{a}}Publicize{{/a}}.', {
									components: {
										a: <a href={ `/sharing/${ siteSlug }` } />
									}
								}
							) }
						</div>
					</div>
					{ this.renderRequestSharingNotice() }
					{ this.renderConnectionsWarning() }
					{ this.renderPrimarySection() }
				</div>
				<QueryPosts { ...{ siteId, postId } } />
				<SharingPreviewModal
					siteId={ siteId }
					postId={ postId }
					message={ this.state.message }
					isVisible={ this.state.showSharingPreview }
					onClose={ this.toggleSharingPreview }
				/>
			</div>
		);
	}
}
export default connect(
	( state, props ) => {
		const { siteId } = props;
		const postId = get( props, 'post.ID' );
		const postType = get( props, 'post.type' );
		const userId = getCurrentUserId( state );
		const planSlug = getSitePlanSlug( state, siteId );

		return {
			siteId,
			postId,
			planSlug,
			isJetpack: isJetpackSite( state, siteId ),
			hasFetchedConnections: siteHasFetchedConnections( state, siteId ),
			hasRepublicizeFeature: hasFeature( state, siteId, FEATURE_REPUBLICIZE ),
			hasRepublicizeSchedulingFeature: hasFeature( state, siteId, FEATURE_REPUBLICIZE_SCHEDULING ),
			siteSlug: getSiteSlug( state, siteId ),
			isPublicizeEnabled: isPublicizeEnabled( state, siteId, postType ),
			scheduling: isSchedulingPublicizeShareAction( state, siteId, postId ),
			connections: getSiteUserConnections( state, siteId, userId ),
			requesting: isRequestingSharePost( state, siteId, postId ),
			schedulingFailed: isSchedulingPublicizeShareActionError( state, siteId, postId ),
			failed: sharePostFailure( state, siteId, postId ),
			success: sharePostSuccessMessage( state, siteId, postId ),
			scheduledAt: getScheduledPublicizeShareActionTime( state, siteId, postId ),
			businessRawPrice: getSitePlanRawPrice( state, siteId, PLAN_BUSINESS, { isMonthly: true } ),
			businessDiscountedRawPrice: getPlanDiscountedRawPrice( state, siteId, PLAN_BUSINESS, { isMonthly: true } ),
			userCurrency: getCurrentUserCurrencyCode( state ),
		};
	},
	{ requestConnections, sharePost, dismissShareConfirmation, schedulePostShareAction }
)( localize( PostShare ) );
