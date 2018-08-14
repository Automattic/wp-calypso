/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import scrollTo from 'lib/scroll-to';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActivityActor from './activity-actor';
import ActivityMedia from './activity-media';
import ActivityIcon from './activity-icon';
import ActivityLogConfirmDialog from '../activity-log-confirm-dialog';
import Gridicon from 'gridicons';
import HappychatButton from 'components/happychat/button';
import Button from 'components/button';
import SplitButton from 'components/split-button';
import FoldableCard from 'components/foldable-card';
import FormattedBlock from 'components/notes-formatted-block';
import PopoverMenuItem from 'components/popover/menu-item';
import {
	rewindBackup,
	rewindBackupDismiss,
	rewindRequestBackup,
	rewindRequestDismiss,
	rewindRequestRestore,
	rewindRestore,
} from 'state/activity-log/actions';
import { recordTracksEvent, withAnalytics } from 'state/analytics/actions';
import getRequestedBackup from 'state/selectors/get-requested-backup';
import getRequestedRewind from 'state/selectors/get-requested-rewind';
import getRewindState from 'state/selectors/get-rewind-state';
import getSiteGmtOffset from 'state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'state/selectors/get-site-timezone-value';
import { adjustMoment } from '../activity-log/utils';
import { getSite } from 'state/sites/selectors';

class ActivityLogItem extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,

		// Connected props
		siteSlug: PropTypes.string.isRequired,

		// localize
		translate: PropTypes.func.isRequired,
	};

	confirmBackup = () => this.props.confirmBackup( this.props.activity.rewindId );

	confirmRewind = () => this.props.confirmRewind( this.props.activity.rewindId );

	renderHeader() {
		const {
			activityTitle,
			actorAvatarUrl,
			actorName,
			actorRole,
			actorType,
			activityMedia,
		} = this.props.activity;
		return (
			<div className="activity-log-item__card-header">
				<ActivityActor { ...{ actorAvatarUrl, actorName, actorRole, actorType } } />
				{ activityMedia && (
					<ActivityMedia
						className={ classNames( {
							'activity-log-item__activity-media': true,
							'is-desktop': true,
							'has-gridicon': ! activityMedia.available,
						} ) }
						icon={ ! activityMedia.available && activityMedia.gridicon }
						name={ activityMedia.available && activityMedia.name }
						thumbnail={ activityMedia.available && activityMedia.thumbnail_url }
						fullImage={ false }
					/>
				) }
				<div className="activity-log-item__description">
					<div className="activity-log-item__description-content">
						{ this.getActivityDescription() }
					</div>
					<div className="activity-log-item__description-summary">{ activityTitle }</div>
				</div>
				{ activityMedia && (
					<ActivityMedia
						className="activity-log-item__activity-media is-mobile"
						icon={ false }
						name={ activityMedia.available && activityMedia.name }
						thumbnail={ false }
						fullImage={ activityMedia.available && activityMedia.medium_url }
					/>
				) }
			</div>
		);
	}

	/**
	 * Returns formatted activity descriptions straight from ActivityStream or with updates performed here.
	 * Since after logging an event in ActivityStream it's impossible to change it,
	 * this updates the text for some specific events whose status might have changed after they were logged.
	 * In this way we're not showing to the user incorrect facts that might be different now.
	 *
	 * @returns {object|string} Activity description, possibly with inserted markup.
	 */
	getActivityDescription() {
		const {
			activity: { activityName, activityDescription, activityMeta },
			translate,
			rewindIsActive,
		} = this.props;

		// If backup failed due to invalid credentials but Rewind is now active means it was fixed.
		if (
			'rewind__backup_error' === activityName &&
			'bad_credentials' === activityMeta.errorCode &&
			rewindIsActive
		) {
			return translate(
				'Jetpack had some trouble connecting to your site, but that problem has been resolved.'
			);
		}

		/* There is no great way to generate a more valid React key here
		 * but the index is probably sufficient because these sub-items
		 * shouldn't be changing. */
		return activityDescription.map( ( part, i ) => <FormattedBlock key={ i } content={ part } /> );
	}

	renderItemAction() {
		const {
			enableClone,
			hideRestore,
			activity: { activityIsRewindable, activityName, activityMeta },
		} = this.props;

		if ( enableClone ) {
			return activityIsRewindable ? this.renderCloneAction() : null;
		}

		switch ( activityName ) {
			case 'rewind__scan_result_found':
				return this.renderHelpAction();
			case 'rewind__backup_error':
				return 'bad_credentials' === activityMeta.errorCode
					? this.renderFixCredsAction()
					: this.renderHelpAction();
		}

		if ( ! hideRestore && activityIsRewindable ) {
			return this.renderRewindAction();
		}
	}

	renderCloneAction = () => {
		const { translate } = this.props;

		return (
			<div className="activity-log-item__action">
				<Button
					className="activity-log-item__clone-action"
					primary
					compact
					onClick={ this.performCloneAction }
				>
					{ translate( 'Clone from here' ) }
				</Button>
			</div>
		);
	};

	performCloneAction = () => this.props.cloneOnClick( this.props.activity.activityTs );

	renderRewindAction() {
		const { createBackup, createRewind, disableRestore, disableBackup, translate } = this.props;

		return (
			<div className="activity-log-item__action">
				<SplitButton
					icon="history"
					label={ translate( 'Rewind' ) }
					onClick={ createRewind }
					disableMain={ disableRestore }
					disabled={ disableRestore && disableBackup }
					compact
					primary={ ! disableRestore }
				>
					<PopoverMenuItem
						disabled={ disableBackup }
						icon="cloud-download"
						onClick={ createBackup }
					>
						{ translate( 'Download backup' ) }
					</PopoverMenuItem>
				</SplitButton>
			</div>
		);
	}

	/**
	 * Displays a button for users to get help. Tracks button click.
	 *
	 * @returns {Object} Get help button.
	 */
	renderHelpAction = () => (
		<HappychatButton
			className="activity-log-item__help-action"
			borderless={ false }
			onClick={ this.handleTrackHelp }
		>
			<Gridicon icon="chat" size={ 18 } />
			{ this.props.translate( 'Get help' ) }
		</HappychatButton>
	);

	handleTrackHelp = () => this.props.trackHelp( this.props.activity.activityName );

	/**
	 * Displays a button to take users to enter credentials.
	 *
	 * @returns {Object} Get button to fix credentials.
	 */
	renderFixCredsAction = () => {
		if ( this.props.rewindIsActive ) {
			return null;
		}
		const { siteId, siteSlug, trackFixCreds, translate, canAutoconfigure } = this.props;
		return (
			<Button
				className="activity-log-item__quick-action"
				primary
				compact
				href={
					canAutoconfigure
						? `/start/rewind-auto-config/?blogid=${ siteId }&siteSlug=${ siteSlug }`
						: `/start/rewind-setup/?siteId=${ siteId }&siteSlug=${ siteSlug }`
				}
				onClick={ trackFixCreds }
			>
				{ translate( 'Fix credentials' ) }
			</Button>
		);
	};

	render() {
		const {
			activity,
			className,
			dismissBackup,
			dismissRewind,
			gmtOffset,
			mightBackup,
			mightRewind,
			moment,
			timezone,
			translate,
		} = this.props;
		const { activityIcon, activityStatus, activityTs } = activity;

		const classes = classNames( 'activity-log-item', className );

		const adjustedTime = adjustMoment( { gmtOffset, moment: moment.utc( activityTs ), timezone } );

		return (
			<React.Fragment>
				{ mightRewind && (
					<ActivityLogConfirmDialog
						key="activity-rewind-dialog"
						confirmTitle={ translate( 'Confirm Rewind' ) }
						notice={
							// eslint-disable-next-line wpcalypso/jsx-classname-namespace
							<span className="activity-log-confirm-dialog__notice-content">
								{ translate(
									'This will remove all content and options created or changed since then.'
								) }
							</span>
						}
						onClose={ dismissRewind }
						onConfirm={ this.confirmRewind }
						supportLink="https://jetpack.com/support/how-to-rewind"
						title={ translate( 'Rewind Site' ) }
					>
						{ translate(
							'This is the selected point for your site Rewind. ' +
								'Are you sure you want to rewind your site back to {{time/}}?',
							{
								components: {
									time: <b>{ adjustedTime.format( 'LLL' ) }</b>,
								},
							}
						) }
					</ActivityLogConfirmDialog>
				) }
				{ mightBackup && (
					<ActivityLogConfirmDialog
						key="activity-backup-dialog"
						confirmTitle={ translate( 'Create download' ) }
						onClose={ dismissBackup }
						onConfirm={ this.confirmBackup }
						supportLink="https://jetpack.com/support/backups"
						title={ translate( 'Create downloadable backup' ) }
						type={ 'backup' }
						icon={ 'cloud-download' }
					>
						{ translate(
							'We will build a downloadable backup of your site at {{time/}}. ' +
								'You will get a notification when the backup is ready to download.',
							{
								components: {
									time: <b>{ adjustedTime.format( 'LLL' ) }</b>,
								},
							}
						) }
					</ActivityLogConfirmDialog>
				) }
				<div className={ classes }>
					<div className="activity-log-item__type">
						<div className="activity-log-item__time" title={ adjustedTime.format( 'LTS' ) }>
							{ adjustedTime.format( 'LT' ) }
						</div>
						<ActivityIcon activityIcon={ activityIcon } activityStatus={ activityStatus } />
					</div>
					<FoldableCard
						className="activity-log-item__card"
						expandedSummary={ this.renderItemAction() }
						header={ this.renderHeader() }
						summary={ this.renderItemAction() }
					/>
				</div>
			</React.Fragment>
		);
	}
}

const mapStateToProps = ( state, { activity, siteId } ) => {
	const rewindState = getRewindState( state, siteId );
	const site = getSite( state, siteId );

	return {
		activity,
		gmtOffset: getSiteGmtOffset( state, siteId ),
		mightBackup: activity && activity.activityId === getRequestedBackup( state, siteId ),
		mightRewind: activity && activity.activityId === getRequestedRewind( state, siteId ),
		timezone: getSiteTimezoneValue( state, siteId ),
		siteSlug: site.slug,
		rewindIsActive: 'active' === rewindState.state || 'provisioning' === rewindState.state,
		canAutoconfigure: rewindState.canAutoconfigure,
		site,
	};
};

const mapDispatchToProps = ( dispatch, { activity: { activityId }, siteId } ) => ( {
	createBackup: () =>
		dispatch(
			withAnalytics(
				recordTracksEvent( 'calypso_activitylog_backup_request', { from: 'item' } ),
				rewindRequestBackup( siteId, activityId )
			)
		),
	createRewind: () =>
		dispatch(
			withAnalytics(
				recordTracksEvent( 'calypso_activitylog_restore_request', { from: 'item' } ),
				rewindRequestRestore( siteId, activityId )
			)
		),
	dismissBackup: () =>
		dispatch(
			withAnalytics(
				recordTracksEvent( 'calypso_activitylog_backup_cancel' ),
				rewindBackupDismiss( siteId )
			)
		),
	dismissRewind: () =>
		dispatch(
			withAnalytics(
				recordTracksEvent( 'calypso_activitylog_restore_cancel' ),
				rewindRequestDismiss( siteId )
			)
		),
	confirmBackup: rewindId => (
		scrollTo( { x: 0, y: 0, duration: 250 } ),
		dispatch(
			withAnalytics(
				recordTracksEvent( 'calypso_activitylog_backup_confirm', { action_id: rewindId } ),
				rewindBackup( siteId, rewindId )
			)
		)
	),
	confirmRewind: rewindId => (
		scrollTo( { x: 0, y: 0, duration: 250 } ),
		dispatch(
			withAnalytics(
				recordTracksEvent( 'calypso_activitylog_restore_confirm', { action_id: rewindId } ),
				rewindRestore( siteId, rewindId )
			)
		)
	),
	trackHelp: activityName =>
		dispatch(
			recordTracksEvent( 'calypso_activitylog_event_get_help', { activity_name: activityName } )
		),
	trackFixCreds: () => dispatch( recordTracksEvent( 'calypso_activitylog_event_fix_credentials' ) ),
} );

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( localize( ActivityLogItem ) );
