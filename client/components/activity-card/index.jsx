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
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { settingsPath } from 'calypso/lib/jetpack/paths';
import { withApplySiteOffset } from 'calypso/components/site-offset';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import ActivityActor from 'calypso/components/activity-card/activity-actor';
import ActivityDescription from 'calypso/components/activity-card/activity-description';
import ActivityMedia from 'calypso/components/activity-card/activity-media';
import Button from 'calypso/components/forms/form-button';
import ExternalLink from 'calypso/components/external-link';
import getAllowRestore from 'calypso/state/selectors/get-allow-restore';
import getDoesRewindNeedCredentials from 'calypso/state/selectors/get-does-rewind-need-credentials';
import { getActionableRewindId } from 'calypso/lib/jetpack/actionable-rewind-id';
import Gridicon from 'calypso/components/gridicon';
import PopoverMenu from 'calypso/components/popover/menu';
import QueryRewindState from 'calypso/components/data/query-rewind-state';
import StreamsMediaPreview from './activity-card-streams-media-preview';

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

	state = {
		showTopPopoverMenu: false,
		showBottomPopoverMenu: false,
		showContent: false,
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
		const { activity, doesRewindNeedCredentials, siteSlug, translate } = this.props;

		const context = isTopToolbar ? this.topPopoverContext : this.bottomPopoverContext;

		const showPopoverMenu = isTopToolbar
			? this.state.showTopPopoverMenu
			: this.state.showBottomPopoverMenu;

		// The activity itself may not be rewindable, but at least one of the
		// streams should be; if this is the case, make sure we send the user
		// to a valid restore/download point when they click an action button
		const actionableRewindId = getActionableRewindId( activity );

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

		return (
			<div className={ classnames( className, 'activity-card' ) }>
				<QueryRewindState siteId={ siteId } />
				{ ! summarize && (
					<div className="activity-card__time">
						<Gridicon icon={ activity.activityIcon } className="activity-card__time-icon" />
						<div className="activity-card__time-text">{ backupTimeDisplay }</div>
					</div>
				) }
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

	return {
		allowRestore: getAllowRestore( state, siteId ),
		doesRewindNeedCredentials: getDoesRewindNeedCredentials( state, siteId ),
		siteId,
		siteSlug,
	};
};

const mapDispatchToProps = () => ( {
	dispatchRecordTracksEvent: recordTracksEvent,
} );

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( withLocalizedMoment( withApplySiteOffset( localize( ActivityCard ) ) ) );
