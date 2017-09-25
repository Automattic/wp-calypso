/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { get, includes, map, concat } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ConnectionsList, { NoConnectionsNotice } from './connections-list';
import ActionsList from './publicize-actions-list';
import SharingPreviewModal from './sharing-preview-modal';
import CalendarButton from 'blocks/calendar-button';
import { UpgradeToPremiumNudge } from 'blocks/post-share/nudges';
import Button from 'components/button';
import ButtonGroup from 'components/button-group';
import QueryPostTypes from 'components/data/query-post-types';
import QueryPosts from 'components/data/query-posts';
import QueryPublicizeConnections from 'components/data/query-publicize-connections';
import EventsTooltip from 'components/date-picker/events-tooltip';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import SectionHeader from 'components/section-header';
import Tooltip from 'components/tooltip';
import { isEnabled } from 'config';
import analytics from 'lib/analytics';
import TrackComponentView from 'lib/analytics/track-component-view';
import { FEATURE_REPUBLICIZE, PLAN_PREMIUM, PLAN_JETPACK_PREMIUM } from 'lib/plans/constants';
import PostMetadata from 'lib/post-metadata';
import PublicizeMessage from 'post-editor/editor-sharing/publicize-message';
import { getCurrentUserId, getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import { getPostShareScheduledActions, getPostSharePublishedActions } from 'state/selectors';
import { isPublicizeEnabled, isSchedulingPublicizeShareAction, getScheduledPublicizeShareActionTime, isSchedulingPublicizeShareActionError } from 'state/selectors';
import { fetchConnections as requestConnections, sharePost, dismissShareConfirmation } from 'state/sharing/publicize/actions';
import { schedulePostShareAction } from 'state/sharing/publicize/publicize-actions/actions';
import { getSiteUserConnections, hasFetchedConnections as siteHasFetchedConnections } from 'state/sharing/publicize/selectors';
import { isRequestingSharePost, sharePostFailure, sharePostSuccessMessage } from 'state/sharing/publicize/selectors';
import { hasFeature, getSitePlanRawPrice, getPlanDiscountedRawPrice } from 'state/sites/plans/selectors';
import { getSiteSlug, getSitePlanSlug, isJetpackSite } from 'state/sites/selectors';

class PostShare extends Component {
	static propTypes = {
		// parent prps
		post: PropTypes.object,
		siteId: PropTypes.number,
		disabled: PropTypes.bool,
		showClose: PropTypes.bool,
		onClose: PropTypes.func,

		// connect prps
		connections: PropTypes.array,
		failed: PropTypes.bool,
		hasFetchedConnections: PropTypes.bool,
		hasRepublicizeFeature: PropTypes.bool,
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
		message: PostMetadata.publicizeMessage( this.props.post ) || '',
		skipped: PostMetadata.publicizeSkipped( this.props.post ) || [],
		showSharingPreview: false,
		showAccountTooltip: false,
		scheduledDate: null,
		showTooltip: false,
		tooltipContext: null,
		eventsByDay: [],
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
				requireCount={ requireCount }
				onChange={ this.setMessage }
				acceptableLength={ acceptableLength } />
		);
	}

	showCalendarTooltip = ( date, modifiers, event, eventsByDay ) => {
		this.setState( {
			eventsByDay,
			context: event.target,
			showTooltip: true,
		} );
	};

	hideEventsTooltip = () => {
		this.setState( {
			eventsByDay: [],
			context: null,
			showTooltip: false,
		} );
	};

	renderSharingButtons() {
		const {
			siteId,
			translate,
			publishedActions,
			scheduledActions,
		} = this.props;

		const shareButton = <Button
			className="post-share__share-button"
			busy={ this.props.requesting }
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

		const actionsEvents = map( concat( publishedActions, scheduledActions ), ( { ID, message, date, service } ) => ( {
			id: ID,
			type: 'published-action',
			title: message,
			date,
			socialIcon: service === 'google_plus' ? 'google-plus' : service,
		} ) );

		// custom tooltip title
		const { eventsByDay } = this.state;

		const tooltipTitle = this.props.translate(
			'%d share',
			'%d shares', {
				count: eventsByDay.length,
				args: eventsByDay.length,
			}
		);

		const maxEvents = 8;
		const moreShares = eventsByDay.length - maxEvents;

		const tooltipMoreEventsLabel = this.props.translate(
			'… and %d more share',
			'… and %d more shares', {
				count: moreShares,
				args: moreShares
			}
		);

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
						events={ actionsEvents }
						className="post-share__schedule-button"
						disabled={ this.isDisabled() }
						disabledDays={ [ { before: new Date() } ] }
						enableOutsideDays={ false }
						title={ translate( 'Set date and time' ) }
						selectedDay={ this.state.scheduledDate }
						tabIndex={ 3 }
						siteId={ siteId }
						onDateChange={ this.scheduleDate }
						onDayMouseEnter={ this.showCalendarTooltip }
						onDayMouseLeave={ this.hideEventsTooltip }
						onClose={ this.hideEventsTooltip }
						popoverPosition="bottom left"
					/>
				</ButtonGroup>

				<EventsTooltip
					events={ eventsByDay }
					context={ this.state.context }
					isVisible={ this.state.showTooltip }
					title={ tooltipTitle }
					moreEventsLabel={ tooltipMoreEventsLabel }
					maxEvents={ maxEvents }
				/>
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
					{ translate( 'We\'ll share your post on %s.', {
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
			siteSlug,
			translate,
		} = this.props;

		if ( ! hasFetchedConnections ) {
			return null;
		}

		if ( ! this.hasConnections() ) {
			return (
				<NoConnectionsNotice { ...{
					siteSlug,
					translate,
				} } />
			);
		}

		if ( ! hasRepublicizeFeature ) {
			return (
				<div>
					<UpgradeToPremiumNudge { ...this.props } />
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

				<ActionsList { ...this.props } />
			</div>
		);
	}

	render() {
		if ( ! this.props.isPublicizeEnabled ) {
			return null;
		}

		const {
			hasRepublicizeFeature,
			hasFetchedConnections,
			postId,
			siteId,
			siteSlug,
			translate,
			showClose,
			onClose,
		} = this.props;

		if ( ! siteId || ! postId ) {
			return null;
		}

		const classes = classNames( 'post-share__wrapper', {
			'is-placeholder': ! hasFetchedConnections,
			'has-connections': this.hasConnections(),
			'has-republicize-scheduling-feature': hasRepublicizeFeature,
		} );

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
					{ showClose && (
						<Button
							borderless
							aria-label={ translate( 'Close post sharing' ) }
							className="post-share__close"
							data-tip-target="post-share__close"
							onClick={ onClose }
						>
							<Gridicon icon="cross" />
						</Button>
					) }
					{ ! hasFetchedConnections && (
						<div className="post-share__placeholder" />
					) }
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

const getDiscountedOrRegularPrice = ( state, siteId, plan ) => (
	getPlanDiscountedRawPrice( state, siteId, plan, { isMonthly: true } ) ||
	getSitePlanRawPrice( state, siteId, plan, { isMonthly: true } )
);

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
			siteSlug: getSiteSlug( state, siteId ),
			isPublicizeEnabled: isPublicizeEnabled( state, siteId, postType ),
			scheduling: isSchedulingPublicizeShareAction( state, siteId, postId ),
			connections: getSiteUserConnections( state, siteId, userId ),
			requesting: isRequestingSharePost( state, siteId, postId ),
			schedulingFailed: isSchedulingPublicizeShareActionError( state, siteId, postId ),
			failed: sharePostFailure( state, siteId, postId ),
			success: sharePostSuccessMessage( state, siteId, postId ),
			scheduledAt: getScheduledPublicizeShareActionTime( state, siteId, postId ),
			premiumPrice: getDiscountedOrRegularPrice( state, siteId, PLAN_PREMIUM ),
			jetpackPremiumPrice: getDiscountedOrRegularPrice( state, siteId, PLAN_JETPACK_PREMIUM ),
			userCurrency: getCurrentUserCurrencyCode( state ),
			scheduledActions: getPostShareScheduledActions( state, siteId, postId ),
			publishedActions: getPostSharePublishedActions( state, siteId, postId ),
		};
	},
	{ requestConnections, sharePost, dismissShareConfirmation, schedulePostShareAction }
)( localize( PostShare ) );
