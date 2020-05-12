/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import Button from 'components/forms/form-button';
import { Card } from '@automattic/components';
import ActivityActor from 'my-sites/activity/activity-log-item/activity-actor';
import ActivityDescription from 'my-sites/activity/activity-log-item/activity-description';
import ActivityMedia from 'my-sites/activity/activity-log-item/activity-media';
import { applySiteOffset } from 'lib/site/timezone';
import PopoverMenu from 'components/popover/menu';
import {
	backupDownloadPath,
	backupRestorePath,
} from 'landing/jetpack-cloud/sections/backups/paths';

/**
 * Style dependencies
 */
import './style.scss';
import downloadIcon from './download-icon.svg';

class ActivityCard extends Component {
	static propTypes = {
		showActions: PropTypes.bool,
		summarize: PropTypes.bool,
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
		if ( topPopoverMenu ) {
			this.setState( { showTopPopoverMenu: ! this.state.showTopPopoverMenu } );
		} else {
			this.setState( { showBottomPopoverMenu: ! this.state.showBottomPopoverMenu } );
		}
	};

	closePopoverMenu = () =>
		this.setState( { showTopPopoverMenu: false, showBottomPopoverMenu: false } );
	toggleSeeContent = () => this.setState( { showContent: ! this.state.showContent } );

	onSpace = ( evt, fn ) => {
		if ( evt.key === ' ' ) {
			return fn;
		}

		return () => {};
	};

	renderStreams( streams = [] ) {
		return streams.map( ( item, index ) => {
			const activityMedia = item.activityMedia;

			return (
				activityMedia &&
				activityMedia.available && (
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
				)
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

	hasStreamContent() {
		const { activity } = this.props;
		return (
			activity.streams && activity.streams.some( ( stream ) => stream.activityMedia?.available )
		);
	}

	renderStreamContent() {
		const { translate } = this.props;

		// todo: handle the rest of cases
		return this.hasStreamContent() ? (
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
		) : null;
	}

	shouldRenderActionButtons() {
		const { activity, showActions } = this.props;
		return activity.activityIsRewindable && showActions;
	}

	renderActionButton( isTopToolbar = true ) {
		const { activity, siteSlug, translate } = this.props;

		const context = isTopToolbar ? this.topPopoverContext : this.bottomPopoverContext;

		const showPopoverMenu = isTopToolbar
			? this.state.showTopPopoverMenu
			: this.state.showBottomPopoverMenu;

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
						href={ backupRestorePath( siteSlug, activity.rewindId ) }
						className="activity-card__restore-button"
					>
						{ translate( 'Restore to this point' ) }
					</Button>
					<Button
						borderless
						compact
						isPrimary={ false }
						href={ backupDownloadPath( siteSlug, activity.rewindId ) }
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
		const shouldRenderActionButtons = this.shouldRenderActionButtons();
		const hasStreamContent = this.hasStreamContent();

		return ! ( hasStreamContent || shouldRenderActionButtons ) ? null : (
			<Fragment key={ `activity-card__toolbar-${ isTopToolbar ? 'top' : 'bottom' }` }>
				<div
					// force the actions to stay in the left if we aren't showing the content link
					className={
						! hasStreamContent && shouldRenderActionButtons
							? 'activity-card__activity-actions-reverse'
							: 'activity-card__activity-actions'
					}
				>
					{ this.renderStreamContent() }
					{ shouldRenderActionButtons && this.renderActionButton( isTopToolbar ) }
				</div>
			</Fragment>
		);
	}

	render() {
		const { activity, allowRestore, className, gmtOffset, summarize, timezone } = this.props;

		const backupTimeDisplay = applySiteOffset( activity.activityTs, {
			timezone,
			gmtOffset,
		} ).format( 'LT' );

		const showActivityContent = this.state.showContent;

		const { activityMedia } = activity;

		return (
			<div className={ classnames( className, 'activity-card' ) }>
				{ ! summarize && (
					<div className="activity-card__time">
						<Gridicon icon={ activity.activityIcon } className="activity-card__time-icon" />
						<div className="activity-card__time-text">{ backupTimeDisplay }</div>
					</div>
				) }
				<Card>
					<ActivityActor
						{ ...{
							actorAvatarUrl: activity.actorAvatarUrl,
							actorName: activity.actorName,
							actorRole: activity.actorRole,
							actorType: activity.actorType,
						} }
					/>
					<div className="activity-card__activity-description">
						{ activityMedia && activityMedia.available && (
							<ActivityMedia
								className="activity-card__activity-media"
								name={ activityMedia.name }
								thumbnail={ activityMedia.medium_url || activityMedia.thumbnail_url }
								fullImage={ false }
							/>
						) }
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

export default localize( ActivityCard );
