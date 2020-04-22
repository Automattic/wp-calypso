/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import Button from 'components/forms/form-button';
import { Card } from '@automattic/components';
import ActivityActor from 'my-sites/activity/activity-log-item/activity-actor';
import ActivityDescription from 'my-sites/activity/activity-log-item/activity-description';
import { applySiteOffset } from 'lib/site/timezone';
import PopoverMenu from 'components/popover/menu';
import {
	backupDetailPath,
	backupDownloadPath,
	backupRestorePath,
} from 'landing/jetpack-cloud/sections/backups/paths';
import { isSuccessfulDailyBackup } from 'landing/jetpack-cloud/sections/backups/utils';

/**
 * Style dependencies
 */
import './style.scss';
import downloadIcon from './download-icon.svg';

class ActivityCard extends Component {
	static propTypes = {
		showActions: PropTypes.bool,
		showContentLink: PropTypes.bool,
		summarize: PropTypes.bool,
	};

	static defaultProps = {
		showActions: true,
		showContentLink: true,
		summarize: false,
	};

	popoverContext = React.createRef();

	state = {
		showPopoverMenu: false,
	};

	togglePopoverMenu = () => this.setState( { showPopoverMenu: ! this.state.showPopoverMenu } );
	closePopoverMenu = () => this.setState( { showPopoverMenu: false } );

	render() {
		const {
			activity,
			allowRestore,
			className,
			gmtOffset,
			showActions,
			showContentLink,
			siteSlug,
			summarize,
			timezone,
			translate,
		} = this.props;

		const backupTimeDisplay = applySiteOffset( activity.activityTs, {
			timezone,
			gmtOffset,
		} ).format( 'LT' );

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
						<ActivityDescription activity={ activity } rewindIsActive={ allowRestore } />
					</div>
					<div className="activity-card__activity-title">{ activity.activityTitle }</div>

					{ ! summarize && (
						<div
							// force the actions to stay in the left if we aren't showing the content link
							className={
								! showContentLink && showActions
									? 'activity-card__activity-actions-reverse'
									: 'activity-card__activity-actions'
							}
						>
							{ showContentLink && (
								<a
									className="activity-card__detail-link"
									href={ backupDetailPath( siteSlug, activity.rewindId ) }
								>
									{ isSuccessfulDailyBackup( activity )
										? translate( 'Changes in this backup' )
										: translate( 'See content' ) }
								</a>
							) }
							{ showActions && (
								<>
									<Button
										compact
										borderless
										className="activity-card__actions-button"
										onClick={ this.togglePopoverMenu }
										ref={ this.popoverContext }
									>
										{ translate( 'Actions' ) }
										<Gridicon icon="add" className="activity-card__actions-icon" />
									</Button>
									<PopoverMenu
										context={ this.popoverContext.current }
										isVisible={ this.state.showPopoverMenu }
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
							) }
						</div>
					) }
				</Card>
			</div>
		);
	}
}

export default localize( ActivityCard );
