/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { backupDownloadPath, backupRestorePath } from 'calypso/my-sites/backup/paths';
import { Card } from '@automattic/components';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { isSuccessfulRealtimeBackup } from 'calypso/lib/jetpack/backup-utils';
import { recordTracksEvent, withAnalytics } from 'calypso/state/analytics/actions';
import { settingsPath } from 'calypso/lib/jetpack/paths';
import { withApplySiteOffset } from 'calypso/components/site-offset';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import ActivityActor from 'calypso/components/activity-card/activity-actor';
import ActivityDescription from 'calypso/components/activity-card/activity-description';
import ActivityMedia from 'calypso/components/activity-card/activity-media';
import Button from 'calypso/components/forms/form-button';
import FormTextInput from 'calypso/components/forms/form-text-input';
import ExternalLink from 'calypso/components/external-link';
import getAllowRestore from 'calypso/state/selectors/get-allow-restore';
import getDoesRewindNeedCredentials from 'calypso/state/selectors/get-does-rewind-need-credentials';
import { getActionableRewindId } from 'calypso/lib/jetpack/actionable-rewind-id';
import Gridicon from 'calypso/components/gridicon';
import PopoverMenu from 'calypso/components/popover/menu';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import StreamsMediaPreview from './activity-card-streams-media-preview';
import isJetpackSiteMultiSite from 'calypso/state/sites/selectors/is-jetpack-site-multi-site';
import { rewindShareRequest } from 'calypso/state/activity-log/actions';

/**
 * Style dependencies
 */
import './style.scss';
import downloadIcon from './download-icon.svg';
import missingCredentialsIcon from 'calypso/components/jetpack/daily-backup-status/missing-credentials.svg';

class ActivityCard extends Component {
	static propTypes = {
		activity: PropTypes.object.isRequired,
		allowRestore: PropTypes.bool.isRequired,
		applySiteOffset: PropTypes.func,
		className: PropTypes.string,
		doesRewindNeedCredentials: PropTypes.bool.isRequired,
		moment: PropTypes.func.isRequired,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string.isRequired,
		summarize: PropTypes.bool,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		summarize: false,
	};

	topPopoverContext = React.createRef();
	bottomPopoverContext = React.createRef();
	sharePopoverContext = React.createRef();

	constructor( props ) {
		super( props );

		this.state = {
			showTopPopoverMenu: false,
			showBottomPopoverMenu: false,
			showContent: false,
			showSharePopover: false,
			shareEmail: '',
			showShareEmailError: false,
		};

		this.handleShareEmailChange = this.handleShareEmailChange.bind( this );
	}

	handleShareEmailChange = ( event ) =>
		this.setState( { shareEmail: event.target.value, showShareEmailError: false } );

	handleShare = () => {
		const email = this.state.shareEmail;
		if ( ! email.includes( '@' ) || ! email.includes( '.' ) ) {
			this.setState( { showShareEmailError: true } );
		} else {
			this.props.shareActivity(
				this.props.siteId,
				this.props.activity.activityId,
				this.state.shareEmail
			);
			this.setState( { showSharePopover: false } );
		}
	};

	togglePopoverMenu = ( topPopoverMenu = true ) => {
		this.props.dispatchRecordTracksEvent( 'calypso_jetpack_backup_actions_click' );

		if ( topPopoverMenu ) {
			this.setState( { showTopPopoverMenu: ! this.state.showTopPopoverMenu } );
		} else {
			this.setState( { showBottomPopoverMenu: ! this.state.showBottomPopoverMenu } );
		}
	};

	closePopoverMenu = () =>
		this.setState( { showTopPopoverMenu: false, showBottomPopoverMenu: false } );

	toggleSharePopover = () => this.setState( { showSharePopover: ! this.state.showSharePopover } );

	closeSharePopover = ( event ) => {
		// bit of a hack here, but it works
		if ( false === event ) {
			this.setState( { showSharePopover: false } );
		}
	};

	toggleSeeContent = () => {
		this.props.dispatchRecordTracksEvent( 'calypso_jetpack_backup_content_expand' );
		this.setState( { showContent: ! this.state.showContent } );
	};

	onSpace = ( evt, fn ) => {
		if ( evt.key === ' ' ) {
			return fn;
		}

		return () => {};
	};

	renderStreams( streams = [] ) {
		const { applySiteOffset, allowRestore, moment, siteSlug, siteId, translate } = this.props;

		return streams.map( ( item, index ) => {
			const activityMedia = item.activityMedia;

			if ( activityMedia && activityMedia.available ) {
				return (
					<div
						key={ `activity-card__streams-item-${ index }` }
						className="activity-card__streams-item"
					>
						<div className="activity-card__streams-item-title">{ activityMedia.name }</div>
						<ActivityMedia
							name={ activityMedia.name }
							fullImage={ activityMedia.medium_url || activityMedia.thumbnail_url }
						/>
					</div>
				);
			}
			return (
				<ActivityCard
					activity={ item }
					allowRestore={ allowRestore }
					applySiteOffset={ applySiteOffset }
					key={ item.activityId }
					moment={ moment }
					siteSlug={ siteSlug }
					siteId={ siteId }
					summarize
					translate={ translate }
				/>
			);
		} );
	}

	renderActivityContent() {
		const { activity } = this.props;

		//todo: add the rest of the cases for expandable content (daily backup,...)
		return (
			<div className="activity-card__content">
				{ !! activity.streams && [
					...this.renderStreams( activity.streams ),
					this.renderBottomToolbar(),
				] }
			</div>
		);
	}

	renderExpandContentControl() {
		const { translate } = this.props;

		return (
			<Button
				compact
				borderless
				className="activity-card__see-content-link"
				onClick={ this.toggleSeeContent }
				onKeyDown={ this.onSpace( this.toggleSeeContent ) }
			>
				{ this.state.showContent ? translate( 'Hide content' ) : translate( 'See content' ) }
				<Gridicon
					size={ 18 }
					icon={ this.state.showContent ? 'chevron-up' : 'chevron-down' }
					className="activity-card__see-content-icon"
				/>
			</Button>
		);
	}

	renderActionButton( isTopToolbar = true ) {
		const { activity, isMultiSite, doesRewindNeedCredentials, siteSlug, translate } = this.props;

		const context = isTopToolbar ? this.topPopoverContext : this.bottomPopoverContext;

		const showPopoverMenu = isTopToolbar
			? this.state.showTopPopoverMenu
			: this.state.showBottomPopoverMenu;

		// The activity itself may not be rewindable, but at least one of the
		// streams should be; if this is the case, make sure we send the user
		// to a valid restore/download point when they click an action button
		const actionableRewindId = getActionableRewindId( activity );

		if ( isMultiSite ) {
			return (
				<Button
					compact
					isPrimary={ true }
					href={ backupDownloadPath( siteSlug, actionableRewindId ) }
					className="activity-card__download-button-multisite"
				>
					{ translate( 'Download backup' ) }
				</Button>
			);
		}

		return (
			<>
				<Button
					compact
					borderless
					className="activity-card__actions-button"
					onClick={ () => {
						return this.togglePopoverMenu( isTopToolbar );
					} }
					ref={ context }
				>
					{ translate( 'Actions' ) }
					<Gridicon icon="add" className="activity-card__actions-icon" />
				</Button>
				<PopoverMenu
					context={ context.current }
					isVisible={ showPopoverMenu }
					onClose={ this.closePopoverMenu }
					className="activity-card__popover"
				>
					<Button
						href={
							! doesRewindNeedCredentials && backupRestorePath( siteSlug, actionableRewindId )
						}
						className="activity-card__restore-button"
						disabled={ doesRewindNeedCredentials }
					>
						{ translate( 'Restore to this point' ) }
					</Button>
					{ doesRewindNeedCredentials && (
						<div className="activity-card__credentials-warning">
							<img src={ missingCredentialsIcon } alt="" role="presentation" />
							<div className="activity-card__credentials-warning-text">
								{ translate(
									'{{a}}Enter your server credentials{{/a}} to enable one-click restores from your backups.',
									{
										components: {
											a: <ExternalLink href={ settingsPath( siteSlug ) } onClick={ () => {} } />,
										},
									}
								) }
							</div>
						</div>
					) }
					<Button
						borderless
						compact
						isPrimary={ false }
						href={ backupDownloadPath( siteSlug, actionableRewindId ) }
						className="activity-card__download-button"
					>
						<img
							src={ downloadIcon }
							className="activity-card__download-icon"
							role="presentation"
							alt=""
						/>
						{ translate( 'Download backup' ) }
					</Button>
				</PopoverMenu>
			</>
		);
	}

	renderShareButton() {
		const { translate } = this.props;

		return (
			<>
				<div className="activity-card__share-button-wrap">
					<Button
						compact
						borderless
						onClick={ this.toggleSharePopover }
						ref={ this.sharePopoverContext }
						className="activity-card__share-button"
					>
						<Gridicon icon="mail" />
						{ translate( 'Share this event' ) }
					</Button>
				</div>
				<PopoverMenu
					context={ this.sharePopoverContext.current }
					isVisible={ this.state.showSharePopover }
					onClose={ this.closeSharePopover }
					position="top"
					className="activity-card__share-popover"
				>
					<div className="activity-card__share-heading">
						{ translate( 'Share this event via email' ) }
					</div>
					<div className="activity-card__share-description">
						{ translate(
							'Share what is happening with your site with your clients or business partners.'
						) }
					</div>
					<div className="activity-card__share-form">
						<FormTextInput
							className="activity-card__share-email"
							placeholder="Email address"
							value={ this.state.shareEmail }
							onChange={ this.handleShareEmailChange }
							isError={ this.state.showShareEmailError }
						/>
						<Button
							className="activity-card__share-submit"
							disabled={ ! this.state.shareEmail }
							onClick={ this.handleShare }
						>
							{ translate( 'Share' ) }
						</Button>
					</div>
					{ this.state.showShareEmailError && (
						<div className="activity-card__share-error">
							{ translate( 'Please enter a valid email address' ) }
						</div>
					) }
				</PopoverMenu>
			</>
		);
	}

	renderTopToolbar = () => this.renderToolbar( true );
	renderBottomToolbar = () => this.renderToolbar( false );

	renderToolbar( isTopToolbar = true ) {
		const { activity } = this.props;

		// Check if the activities in the stream are rewindables
		const isRewindable = isSuccessfulRealtimeBackup( activity );
		const streams = activity.streams;

		return ! ( streams || isRewindable ) ? null : (
			<Fragment key={ `activity-card__toolbar-${ isTopToolbar ? 'top' : 'bottom' }` }>
				<div
					// force the actions to stay in the left if we aren't showing the content link
					className={
						! streams && isRewindable
							? 'activity-card__activity-actions-reverse'
							: 'activity-card__activity-actions'
					}
				>
					{ streams && this.renderExpandContentControl() }
					{ isRewindable && this.renderActionButton( isTopToolbar ) }
				</div>
			</Fragment>
		);
	}

	renderMediaPreview() {
		const {
			activity: { streams, activityMedia },
		} = this.props;

		if (
			streams &&
			streams.filter( ( { activityMedia: streamActivityMedia } ) => streamActivityMedia?.available )
				.length > 2
		) {
			return <StreamsMediaPreview streams={ streams } />;
		} else if ( activityMedia?.available ) {
			return (
				<ActivityMedia
					name={ activityMedia.name }
					thumbnail={ activityMedia.medium_url || activityMedia.thumbnail_url }
				/>
			);
		}
		return null;
	}

	render() {
		const { activity, allowRestore, applySiteOffset, className, siteId, summarize } = this.props;

		const backupTimeDisplay = applySiteOffset
			? applySiteOffset( activity.activityTs ).format( 'LT' )
			: '';
		const showActivityContent = this.state.showContent;
		const hasActivityFailed = activity.activityStatus === 'error';

		return (
			<div
				className={ classnames( className, 'activity-card', {
					'with-error': hasActivityFailed,
				} ) }
			>
				<QueryRewindState siteId={ siteId } />
				{ ! summarize && (
					<div className="activity-card__time">
						<Gridicon icon={ activity.activityIcon } className="activity-card__time-icon" />
						<div className="activity-card__time-text">{ backupTimeDisplay }</div>
					</div>
				) }
				{ ! summarize && this.renderShareButton() }
				<Card>
					<ActivityActor
						actorAvatarUrl={ activity.actorAvatarUrl }
						actorName={ activity.actorName }
						actorRole={ activity.actorRole }
						actorType={ activity.actorType }
					/>
					<div className="activity-card__activity-description">
						{ this.renderMediaPreview() }
						<ActivityDescription activity={ activity } rewindIsActive={ allowRestore } />
					</div>
					<div className="activity-card__activity-title">{ activity.activityTitle }</div>

					{ ! summarize && this.renderTopToolbar() }

					{ showActivityContent && this.renderActivityContent() }
				</Card>
			</div>
		);
	}
}

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );
	const isMultiSite = isJetpackSiteMultiSite( state, siteId );

	return {
		allowRestore: getAllowRestore( state, siteId ),
		doesRewindNeedCredentials: getDoesRewindNeedCredentials( state, siteId ),
		siteId,
		siteSlug,
		isMultiSite,
	};
};

const mapDispatchToProps = ( dispatch ) => ( {
	dispatchRecordTracksEvent: recordTracksEvent,
	shareActivity: ( siteId, activityId, email ) => {
		dispatch(
			withAnalytics(
				recordTracksEvent( 'calypso_activity_share_request' ),
				rewindShareRequest( siteId, activityId, email )
			)
		);
	},
} );

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( withLocalizedMoment( withApplySiteOffset( localize( ActivityCard ) ) ) );
