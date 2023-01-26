import { Button, Gridicon } from '@automattic/components';
import { withDesktopBreakpoint } from '@automattic/viewport-react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { flowRight as compose } from 'lodash';
import PropTypes from 'prop-types';
import { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import FoldableCard from 'calypso/components/foldable-card';
import HappychatButton from 'calypso/components/happychat/button';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { settingsPath } from 'calypso/lib/jetpack/paths';
import scrollTo from 'calypso/lib/scroll-to';
import { applySiteOffset } from 'calypso/lib/site/timezone';
import {
	rewindBackup,
	rewindBackupDismiss,
	rewindRequestBackup,
	rewindRequestDismiss,
	rewindRequestRestore,
	rewindRestore,
} from 'calypso/state/activity-log/actions';
import { recordTracksEvent, withAnalytics } from 'calypso/state/analytics/actions';
import getRequestedBackup from 'calypso/state/selectors/get-requested-backup';
import getRequestedRewind from 'calypso/state/selectors/get-requested-rewind';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import getSiteGmtOffset from 'calypso/state/selectors/get-site-gmt-offset';
import getSiteTimezoneValue from 'calypso/state/selectors/get-site-timezone-value';
import { getSite } from 'calypso/state/sites/selectors';
import ActivityLogConfirmDialog from '../activity-log-confirm-dialog';
import ActivityActor from './activity-actor';
import ActivityDescription from './activity-description';
import ActivityIcon from './activity-icon';
import ActivityMedia from './activity-media';

import './style.scss';

class ActivityLogItem extends Component {
	static propTypes = {
		className: PropTypes.string,

		siteId: PropTypes.number.isRequired,

		activity: PropTypes.object.isRequired,

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

		const rewindAction = this.renderRewindAction();

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
					<div className="activity-log-item__description-text">
						<div className="activity-log-item__description-content">
							<ActivityDescription
								activity={ this.props.activity }
								rewindIsActive={ this.props.rewindIsActive }
							/>
						</div>
						<div className="activity-log-item__description-summary">{ activityTitle }</div>
					</div>
					{ rewindAction && (
						<div className="activity-log-item__description-actions">{ rewindAction }</div>
					) }
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
			activity: { activityName, activityMeta },
		} = this.props;

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
			<Button
				className="activity-log-item__clone-action"
				primary
				compact
				onClick={ this.performCloneAction }
			>
				{ translate( 'Clone from here' ) }
			</Button>
		);
	};

	performCloneAction = () => this.props.cloneOnClick( this.props.activity.activityTs );

	showCredentialsButton = () => this.props.disableRestore && this.props.missingRewindCredentials;

	renderRewindAction = () => {
		const {
			activity,
			canAutoconfigure,
			createBackup,
			createRewind,
			disableBackup,
			disableRestore,
			enableClone,
			siteId,
			siteSlug,
			trackAddCreds,
			translate,
		} = this.props;

		if ( ! activity.activityIsRewindable ) {
			return null;
		}

		const showCredentialsButton = this.showCredentialsButton();
		const isCompact = showCredentialsButton;

		return (
			<div className="activity-log-item__action">
				{ ! showCredentialsButton && ! enableClone && (
					<Button compact={ isCompact } disabled={ disableRestore } onClick={ createRewind }>
						<Gridicon icon="history" size={ 18 } /> { translate( 'Restore' ) }
					</Button>
				) }

				{ showCredentialsButton && (
					<Button
						compact={ isCompact }
						href={
							canAutoconfigure
								? `/start/rewind-auto-config/?blogid=${ siteId }&siteSlug=${ siteSlug }`
								: `${ settingsPath( siteSlug ) }#credentials`
						}
						onClick={ trackAddCreds }
					>
						<Gridicon icon="plus" size={ 18 } />{ ' ' }
						{ translate( 'Add server credentials to enable restoring' ) }
					</Button>
				) }

				{ ! enableClone && (
					<Button compact={ isCompact } disabled={ disableBackup } onClick={ createBackup }>
						<Gridicon icon="cloud-download" size={ 18 } /> { translate( 'Download' ) }
					</Button>
				) }

				{ enableClone && this.renderCloneAction() }
			</div>
		);
	};

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
			gmtOffset,
			mightBackup,
			mightRewind,
			moment,
			timezone,
			translate,
			disableRestore,
		} = this.props;
		const { activityIcon, activityStatus, activityTs } = activity;

		const classes = classNames( 'activity-log-item', className );

		const adjustedTime = applySiteOffset( moment( activityTs ), { timezone, gmtOffset } );

		return (
			<Fragment>
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
						disableButton={ this.state.disableRestoreButton || disableRestore }
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
						onClose={ this.cancelDownloadIntent }
						onConfirm={ this.confirmBackup }
						onSettingsChange={ this.downloadSettingsChange }
						supportLink="https://jetpack.com/support/backup"
						title={ translate( 'Create downloadable backup' ) }
						type="backup"
						icon="cloud-download"
						disableButton={ this.state.disableDownloadButton }
					>
						{ translate(
							'{{time/}} is the selected point to create a download backup. You will get a notification when the backup is ready to download.',
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
						actionButton={ null }
						summary={ this.renderItemAction() }
					/>
				</div>
			</Fragment>
		);
	}
}

const mapStateToProps = ( state, { className, activity, siteId } ) => {
	const rewindState = getRewindState( state, siteId );
	const site = getSite( state, siteId );

	return {
		className,
		activity,
		gmtOffset: getSiteGmtOffset( state, siteId ),
		mightBackup: activity && activity.activityId === getRequestedBackup( state, siteId ),
		mightRewind: activity && activity.activityId === getRequestedRewind( state, siteId ),
		timezone: getSiteTimezoneValue( state, siteId ),
		siteSlug: site.slug,
		rewindIsActive: 'active' === rewindState.state || 'provisioning' === rewindState.state,
		missingRewindCredentials: rewindState.state === 'awaitingCredentials',
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
