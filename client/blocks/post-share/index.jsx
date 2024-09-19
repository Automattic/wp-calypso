import { isEnabled } from '@automattic/calypso-config';
import { FEATURE_REPUBLICIZE } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { get, includes, map, concat } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import CalendarButton from 'calypso/blocks/calendar-button';
import ButtonGroup from 'calypso/components/button-group';
import QueryPostTypes from 'calypso/components/data/query-post-types';
import QueryPublicizeConnections from 'calypso/components/data/query-publicize-connections';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import EventsTooltip from 'calypso/components/date-picker/events-tooltip';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import PublicizeMessage from 'calypso/components/publicize-message';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { sectionify } from 'calypso/lib/route';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import getPostSharePublishedActions from 'calypso/state/selectors/get-post-share-published-actions';
import getPostShareScheduledActions from 'calypso/state/selectors/get-post-share-scheduled-actions';
import getScheduledPublicizeShareActionTime from 'calypso/state/selectors/get-scheduled-publicize-share-action-time';
import isPublicizeEnabled from 'calypso/state/selectors/is-publicize-enabled';
import isSchedulingPublicizeShareAction from 'calypso/state/selectors/is-scheduling-publicize-share-action';
import isSchedulingPublicizeShareActionError from 'calypso/state/selectors/is-scheduling-publicize-share-action-error';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import {
	fetchConnections as requestConnections,
	sharePost,
	dismissShareConfirmation,
} from 'calypso/state/sharing/publicize/actions';
import { schedulePostShareAction } from 'calypso/state/sharing/publicize/publicize-actions/actions';
import {
	getSiteUserConnections,
	hasFetchedConnections as siteHasFetchedConnections,
	isRequestingSharePost,
	sharePostFailure,
	sharePostSuccessMessage,
} from 'calypso/state/sharing/publicize/selectors';
import { isRequestingSitePlans as siteIsRequestingPlans } from 'calypso/state/sites/plans/selectors';
import { getSiteSlug, getSitePlanSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import ConnectionsList from './connections-list';
import NoConnectionsNotice from './no-connections-notice';
import { UpgradeToPremiumNudge } from './nudges';
import ActionsList from './publicize-actions-list';
import SharingPreviewModal from './sharing-preview-modal';

import './style.scss';

const REGEXP_PUBLICIZE_SERVICE_SKIPPED = /^_wpas_skip_(\d+)$/;

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
		message: this.getPostPublicizeMessage(),
		skipped: this.getPostPublicizeSkipped(),
		showSharingPreview: false,
		scheduledDate: null,
		showTooltip: false,
		eventsByDay: [],
	};

	getPostPublicizeMessage() {
		return this.props.post?.metadata?.find( ( { key } ) => key === '_wpas_mess' )?.value || '';
	}

	getPostPublicizeSkipped() {
		return (
			this.props.post.metadata
				?.filter( function ( meta ) {
					return (
						REGEXP_PUBLICIZE_SERVICE_SKIPPED.test( meta.key ) && 1 === parseInt( meta.value, 10 )
					);
				} )
				?.map( function ( meta ) {
					return parseInt( meta.key.match( REGEXP_PUBLICIZE_SERVICE_SKIPPED )[ 1 ], 10 );
				} ) ?? []
		);
	}

	hasConnections() {
		return !! get( this.props, 'connections.length' );
	}

	toggleConnection = ( id ) => {
		const skipped = this.state.skipped.slice();
		const index = skipped.indexOf( id );
		if ( index !== -1 ) {
			skipped.splice( index, 1 );
		} else {
			skipped.push( id );
		}

		this.setState( { skipped } );
	};

	scheduleDate = ( date ) => {
		if ( date.isBefore( Date.now() ) ) {
			date = null;
		}
		this.setState( { scheduledDate: date } );
	};

	skipConnection( { keyring_connection_ID } ) {
		return this.state.skipped.indexOf( keyring_connection_ID ) === -1;
	}

	isConnectionActive = ( connection ) =>
		connection.status !== 'broken' &&
		connection.status !== 'invalid' &&
		this.skipConnection( connection );

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

		recordTracksEvent( 'calypso_publicize_share_preview_toggle', {
			show: showSharingPreview,
		} );
		this.setState( { showSharingPreview } );
	};

	setMessage = ( message ) => this.setState( { message } );

	dismiss = () => {
		this.props.dismissShareConfirmation( this.props.siteId, this.props.postId );
	};

	sharePost = () => {
		const { postId, siteId, connections, isJetpack } = this.props;
		const servicesToPublish = connections.filter(
			( connection ) => this.state.skipped.indexOf( connection.keyring_connection_ID ) === -1
		);
		//Let's prepare array of service stats for tracks.
		const numberOfAccountsPerService = servicesToPublish.reduce(
			( counts, service ) => {
				counts.service_all = counts.service_all + 1;
				if ( ! counts[ 'service_' + service.service ] ) {
					counts[ 'service_' + service.service ] = 0;
				}
				counts[ 'service_' + service.service ] = counts[ 'service_' + service.service ] + 1;
				return counts;
			},
			{ service_all: 0 }
		);
		const additionalProperties = {
			context_path: sectionify( page.current ),
			is_jetpack: isJetpack,
			blog_id: siteId,
		};
		const eventProperties = { ...numberOfAccountsPerService, ...additionalProperties };

		if ( this.state.scheduledDate ) {
			recordTracksEvent( 'calypso_publicize_share_schedule', eventProperties );

			this.props.schedulePostShareAction(
				siteId,
				postId,
				this.state.message,
				this.state.scheduledDate.format( 'X' ),
				servicesToPublish.map( ( connection ) => connection.ID )
			);
		} else {
			recordTracksEvent( 'calypso_publicize_share_instantly', eventProperties );
			this.props.sharePost( siteId, postId, this.state.skipped, this.state.message );
		}
	};

	isDisabled() {
		if ( this.props.disabled || this.props.requesting || this.activeConnections().length < 1 ) {
			return true;
		}
	}

	previewSharingPost = () => {};

	renderMessage() {
		if ( ! this.hasConnections() ) {
			return;
		}

		const targeted = this.hasConnections()
			? this.props.connections.filter( this.isConnectionActive )
			: [];
		const requireCount = includes( map( targeted, 'service' ), 'twitter' );
		const acceptableLength = requireCount ? 280 - 23 - 23 : null;

		return (
			<PublicizeMessage
				disabled={ this.isDisabled() }
				message={ this.state.message }
				requireCount={ requireCount }
				onChange={ this.setMessage }
				acceptableLength={ acceptableLength }
			/>
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
		const { siteId, translate, publishedActions, scheduledActions } = this.props;

		const shareButton = (
			<Button
				className="post-share__share-button"
				busy={ this.props.requesting }
				primary
				onClick={ this.sharePost }
				disabled={ this.isDisabled() }
			>
				{ this.state.scheduledDate ? translate( 'Schedule post' ) : translate( 'Share post' ) }
			</Button>
		);

		const previewButton = isEnabled( 'publicize-preview' ) && (
			<Button
				disabled={ this.isDisabled() }
				className="post-share__preview-button"
				onClick={ this.toggleSharingPreview }
			>
				{ translate( 'Preview' ) }
			</Button>
		);

		const actionsEvents = map(
			concat( publishedActions, scheduledActions ),
			( { ID, message, date, service } ) => ( {
				id: ID,
				type: 'published-action',
				title: message,
				date,
				socialIcon: service === 'google_plus' ? 'google-plus' : service,
			} )
		);

		// custom tooltip title
		const { eventsByDay } = this.state;

		const tooltipTitle = this.props.translate( '%d share', '%d shares', {
			count: eventsByDay.length,
			args: eventsByDay.length,
		} );

		const maxEvents = 8;
		const moreShares = eventsByDay.length - maxEvents;

		const tooltipMoreEventsLabel = this.props.translate(
			'… and %d more share',
			'… and %d more shares',
			{
				count: moreShares,
				args: moreShares,
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
						showOutsideDays={ false }
						title={ translate( 'Set date and time' ) }
						selectedDay={ this.state.scheduledDate }
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
		const { connections, hasFetchedConnections, siteSlug, translate } = this.props;

		if ( ! hasFetchedConnections || ! connections.length ) {
			return null;
		}

		const brokenConnections = connections.filter(
			( connection ) => connection.status === 'broken'
		);
		const invalidConnections = connections.filter(
			( connection ) => connection.status === 'invalid'
		);

		if ( ! ( brokenConnections.length || invalidConnections.length ) ) {
			return null;
		}

		return (
			<div>
				{ brokenConnections.map( ( connection ) => (
					<Notice
						key={ connection.keyring_connection_ID }
						status="is-warning"
						showDismiss={ false }
						text={ translate( 'There is an issue connecting to %s.', { args: connection.label } ) }
					>
						<NoticeAction href={ `/marketing/connections/${ siteSlug }` }>
							{ translate( 'Reconnect' ) }
						</NoticeAction>
					</Notice>
				) ) }
				{ invalidConnections.map( ( connection ) => (
					<Notice
						key={ connection.keyring_connection_ID }
						status="is-error"
						showDismiss={ false }
						text={
							connection.service === 'facebook'
								? translate( 'Connections to Facebook profiles ceased to work on August 1st.' )
								: translate( 'Connections to %s have a permenant issue which prevents sharing.', {
										args: connection.label,
								  } )
						}
					>
						{ connection.service === 'facebook' && (
							<NoticeAction
								href={ localizeUrl( 'https://wordpress.com/support/publicize/#facebook-pages' ) }
								external
							>
								{ translate( 'Learn More' ) }
							</NoticeAction>
						) }
						<NoticeAction href={ `/marketing/connections/${ siteSlug }` }>
							{ translate( 'Disconnect' ) }
						</NoticeAction>
					</Notice>
				) ) }
			</div>
		);
	}

	renderRequestSharingNotice() {
		const { failed, requesting, success, translate, moment } = this.props;

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
					{ translate( "We'll share your post on %s.", {
						args: moment.unix( this.props.scheduledAt ).format( 'LLLL' ),
					} ) }
				</Notice>
			);
		}

		if ( this.props.schedulingFailed ) {
			return (
				<Notice status="is-error" onDismissClick={ this.dismiss }>
					{ translate( "Scheduling share failed. Please don't be mad." ) }
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

		if ( failed ) {
			return (
				<Notice status="is-error" onDismissClick={ this.dismiss }>
					{ translate( "Something went wrong. Please don't be mad." ) }
				</Notice>
			);
		}
	}

	renderConnectionsSection() {
		const { hasFetchedConnections, siteId, siteSlug, translate } = this.props;

		// enrich connections
		const connections = map( this.props.connections, ( connection ) => ( {
			...connection,
			isActive: this.isConnectionActive( connection ),
		} ) );

		return (
			<div className="post-share__services">
				<ConnectionsList
					{ ...{
						connections,
						hasFetchedConnections,
						siteId,
						siteSlug,
					} }
					onToggle={ this.toggleConnection }
				/>

				<div className="post-share__manage-connections-link">
					{ translate( '{{a}}Manage connections{{/a}}', {
						components: {
							a: <a href={ `/marketing/connections/${ siteId }` } />,
						},
					} ) }
				</div>
			</div>
		);
	}

	renderPrimarySection() {
		const { hasFetchedConnections, hasRepublicizeFeature, siteSlug, siteId } = this.props;

		if ( ! hasFetchedConnections ) {
			return null;
		}

		if ( ! this.hasConnections() ) {
			return <NoConnectionsNotice siteSlug={ siteSlug } />;
		}

		if ( ! hasRepublicizeFeature ) {
			return (
				<div>
					<UpgradeToPremiumNudge siteId={ siteId } />
					<ActionsList { ...this.props } />
				</div>
			);
		}

		return (
			<div>
				<div className="post-share__main">
					{ this.renderConnectionsSection() }

					<div className="post-share__form">
						{ this.renderMessage() }
						{ this.renderSharingButtons() }
					</div>
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
			isRequestingSitePlans,
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

		const classes = clsx( 'post-share__wrapper', {
			'is-placeholder': ! hasFetchedConnections || isRequestingSitePlans,
			'has-connections': this.hasConnections(),
			'has-republicize-scheduling-feature': hasRepublicizeFeature,
		} );

		return (
			<div className="post-share">
				<TrackComponentView eventName="calypso_publicize_post_share_view" />
				<QueryPostTypes siteId={ siteId } />
				<QueryPublicizeConnections siteId={ siteId } />
				<QuerySitePlans siteId={ siteId } />

				<div className={ classes }>
					<div className="post-share__head">
						<div className="post-share__title">
							<span>
								{ translate(
									'Share on your connected social media accounts using ' +
										'{{a}}Jetpack Social{{/a}}.',
									{
										components: {
											a: <a href={ `/marketing/connections/${ siteSlug }` } />,
										},
									}
								) }
							</span>
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
						</div>
					</div>
					{ ! hasFetchedConnections && <div className="post-share__placeholder" /> }
					{ this.renderRequestSharingNotice() }
					{ this.renderConnectionsWarning() }
					{ this.renderPrimarySection() }
				</div>
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
			isRequestingSitePlans: siteIsRequestingPlans( state, siteId ),
			hasRepublicizeFeature: siteHasFeature( state, siteId, FEATURE_REPUBLICIZE ),
			siteSlug: getSiteSlug( state, siteId ),
			isPublicizeEnabled: isPublicizeEnabled( state, siteId, postType ),
			scheduling: isSchedulingPublicizeShareAction( state, siteId, postId ),
			connections: getSiteUserConnections( state, siteId, userId ),
			requesting: isRequestingSharePost( state, siteId, postId ),
			schedulingFailed: isSchedulingPublicizeShareActionError( state, siteId, postId ),
			failed: sharePostFailure( state, siteId, postId ),
			success: sharePostSuccessMessage( state, siteId, postId ),
			scheduledAt: getScheduledPublicizeShareActionTime( state, siteId, postId ),
			userCurrency: getCurrentUserCurrencyCode( state ),
			scheduledActions: getPostShareScheduledActions( state, siteId, postId ),
			publishedActions: getPostSharePublishedActions( state, siteId, postId ),
		};
	},
	{ requestConnections, sharePost, dismissShareConfirmation, schedulePostShareAction }
)( localize( withLocalizedMoment( PostShare ) ) );
