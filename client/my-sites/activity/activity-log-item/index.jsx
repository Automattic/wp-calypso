/**
 * External dependencies
 */
import { withDesktopBreakpoint } from '@automattic/viewport-react';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { flowRight as compose } from 'lodash';

/**
 * Internal dependencies
 */
import scrollTo from 'lib/scroll-to';
import { applySiteOffset } from 'lib/site/timezone';
import ActivityActor from './activity-actor';
import ActivityDescription from './activity-description';
import ActivityMedia from './activity-media';
import ActivityIcon from './activity-icon';
import ActivityLogConfirmDialog from '../activity-log-confirm-dialog';
import EllipsisMenu from 'components/ellipsis-menu';
import Gridicon from 'components/gridicon';
import HappychatButton from 'components/happychat/button';
import { Button } from '@automattic/components';
import FoldableCard from 'components/foldable-card';
import PopoverMenuItem from 'components/popover/menu-item';
import PopoverMenuSeparator from 'components/popover/menu-separator';
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
import { getSite } from 'state/sites/selectors';
import { withLocalizedMoment } from 'components/localized-moment';

/**
 * Style dependencies
 */
import './style.scss';

class ActivityLogItem extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,

		// Connected props
		siteSlug: PropTypes.string.isRequired,

		// localize
		translate: PropTypes.func.isRequired,
	};

	state = {
		restoreArgs: {
			themes: true,
			plugins: true,
			uploads: true,
			sqls: true,
			roots: true,
			contents: true,
		},
		downloadArgs: {
			themes: true,
			plugins: true,
			uploads: true,
			sqls: true,
			roots: true,
			contents: true,
		},
		disableRestoreButton: false,
		disableDownloadButton: false,
	};

	confirmBackup = () =>
		this.props.confirmBackup( this.props.activity.rewindId, this.state.downloadArgs );

	confirmRewind = () =>
		this.props.confirmRewind(
			this.props.activity.rewindId,
			this.props.activity.activityName,
			this.state.restoreArgs
		);

	restoreSettingsChange = ( { target: { name, checked } } ) => {
		this.setState( {
			restoreArgs: Object.assign( this.state.restoreArgs, { [ name ]: checked } ),
			disableRestoreButton: Object.keys( this.state.restoreArgs ).every(
				( k ) => ! this.state.restoreArgs[ k ]
			),
		} );
	};

	downloadSettingsChange = ( { target: { name, checked } } ) => {
		this.setState( {
			downloadArgs: Object.assign( this.state.downloadArgs, { [ name ]: checked } ),
			disableDownloadButton: Object.keys( this.state.downloadArgs ).every(
				( k ) => ! this.state.downloadArgs[ k ]
			),
		} );
	};

	cancelRewindIntent = () => {
		this.props.dismissRewind();
		this.cancelIntent();
	};

	cancelDownloadIntent = () => {
		this.props.dismissBackup();
		this.cancelIntent();
	};

	cancelIntent = () => {
		this.setState( {
			restoreArgs: {
				themes: true,
				plugins: true,
				uploads: true,
				sqls: true,
				roots: true,
				contents: true,
			},
			downloadArgs: {
				themes: true,
				plugins: true,
				uploads: true,
				sqls: true,
				roots: true,
				contents: true,
			},
			disableRestoreButton: false,
			disableDownloadButton: false,
		} );
	};

	sizeChanged = () => {
		this.forceUpdate();
	};

	renderHeader() {
		const {
			activity: {
				activityTitle,
				actorAvatarUrl,
				actorName,
				actorRole,
				actorType,
				activityMedia,
				isBreakpointActive: isDesktop,
			},
		} = this.props;
		return (
			<div className="activity-log-item__card-header">
				<ActivityActor { ...{ actorAvatarUrl, actorName, actorRole, actorType } } />
				{ activityMedia && isDesktop && (
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
						<ActivityDescription
							activity={ this.props.activity }
							rewindIsActive={ this.props.rewindIsActive }
						/>
					</div>
					<div className="activity-log-item__description-summary">{ activityTitle }</div>
				</div>
				{ activityMedia && ! isDesktop && (
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

	renderItemAction() {
		const {
			enableClone,
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
		const {
			activity,
			canAutoconfigure,
			createBackup,
			createRewind,
			disableRestore,
			disableBackup,
			siteId,
			siteSlug,
			trackAddCreds,
			translate,
		} = this.props;

		if ( ! activity.activityIsRewindable ) {
			return null;
		}

		return (
			<div className="activity-log-item__action">
				<EllipsisMenu>
					<PopoverMenuItem disabled={ disableRestore } icon="history" onClick={ createRewind }>
						{ translate( 'Restore to this point' ) }
					</PopoverMenuItem>

					{ disableRestore && (
						<PopoverMenuItem
							icon="plus"
							href={
								canAutoconfigure
									? `/start/rewind-auto-config/?blogid=${ siteId }&siteSlug=${ siteSlug }`
									: `/settings/security/${ siteSlug }#credentials`
							}
							onClick={ trackAddCreds }
						>
							{ translate( 'Add server credentials to enable restoring' ) }
						</PopoverMenuItem>
					) }

					<PopoverMenuSeparator />

					<PopoverMenuItem
						disabled={ disableBackup }
						icon="cloud-download"
						onClick={ createBackup }
					>
						{ translate( 'Download backup' ) }
					</PopoverMenuItem>
				</EllipsisMenu>
			</div>
		);
	}

	/**
	 * Displays a button for users to get help. Tracks button click.
	 *
	 * @returns {object} Get help button.
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
	 * @returns {object} Get button to fix credentials.
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
			gmtOffset,
			mightBackup,
			mightRewind,
			moment,
			timezone,
			translate,
		} = this.props;
		const { activityIcon, activityStatus, activityTs } = activity;

		const classes = classNames( 'activity-log-item', className );

		const adjustedTime = applySiteOffset( moment( activityTs ), { timezone, gmtOffset } );

		return (
			<React.Fragment>
				{ mightRewind && (
					<ActivityLogConfirmDialog
						key="activity-rewind-dialog"
						confirmTitle={ translate( 'Confirm Restore' ) }
						notice={
							this.state.disableRestoreButton
								? translate( 'Please select at least one item to restore.' )
								: translate( 'This will override and remove all content created after this point.' )
						}
						onClose={ this.cancelRewindIntent }
						onConfirm={ this.confirmRewind }
						onSettingsChange={ this.restoreSettingsChange }
						supportLink="https://jetpack.com/support/how-to-rewind"
						title={ translate( 'Restore Site' ) }
						disableButton={ this.state.disableRestoreButton }
					>
						{ translate( '{{time/}} is the selected point for your site restore.', {
							components: {
								time: <b>{ adjustedTime.format( 'LLL' ) }</b>,
							},
						} ) }
					</ActivityLogConfirmDialog>
				) }
				{ mightBackup && (
					<ActivityLogConfirmDialog
						key="activity-backup-dialog"
						confirmTitle={ translate( 'Create download' ) }
						onClose={ this.cancelBackupIntent }
						onConfirm={ this.confirmBackup }
						onSettingsChange={ this.downloadSettingsChange }
						supportLink="https://jetpack.com/support/backup"
						title={ translate( 'Create downloadable backup' ) }
						type={ 'backup' }
						icon={ 'cloud-download' }
						disableButton={ this.state.disableDownloadButton }
					>
						{ translate(
							'{{time/}} is the selected point to create a download backup of. You will get a notification when the backup is ready to download.',
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
						actionButton={ this.renderRewindAction() }
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
	confirmBackup: ( rewindId, downloadArgs ) => (
		scrollTo( { x: 0, y: 0, duration: 250 } ),
		dispatch(
			withAnalytics(
				recordTracksEvent( 'calypso_activitylog_backup_confirm', { action_id: rewindId } ),
				rewindBackup( siteId, rewindId, downloadArgs )
			)
		)
	),
	confirmRewind: ( rewindId, activityName, restoreArgs ) => (
		scrollTo( { x: 0, y: 0, duration: 250 } ),
		dispatch(
			withAnalytics(
				recordTracksEvent( 'calypso_activitylog_restore_confirm', {
					action_id: rewindId,
					activity_name: activityName,
					restore_types: JSON.stringify( restoreArgs ),
				} ),
				rewindRestore( siteId, rewindId, restoreArgs )
			)
		)
	),
	trackHelp: ( activityName ) =>
		dispatch(
			recordTracksEvent( 'calypso_activitylog_event_get_help', { activity_name: activityName } )
		),
	trackAddCreds: () => dispatch( recordTracksEvent( 'calypso_activitylog_event_add_credentials' ) ),
	trackFixCreds: () => dispatch( recordTracksEvent( 'calypso_activitylog_event_fix_credentials' ) ),
} );

export default compose(
	connect( mapStateToProps, mapDispatchToProps ),
	withDesktopBreakpoint,
	withLocalizedMoment,
	localize
)( ActivityLogItem );
