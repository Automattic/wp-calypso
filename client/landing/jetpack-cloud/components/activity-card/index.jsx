/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import Button from 'components/forms/form-button';
import { Card } from '@automattic/components';
import ActivityActor from 'my-sites/activity/activity-log-item/activity-actor';
import ActivityDescription from 'my-sites/activity/activity-log-item/activity-description';
import PopoverMenu from 'components/popover/menu';

/**
 * Style dependencies
 */
import './style.scss';

class ActivityCard extends Component {
	constructor() {
		super();
		this.state = {
			showPopoverMenu: false,
		};
	}

	togglePopoverMenu = () => this.setState( { showPopoverMenu: ! this.state.showPopoverMenu } );

	closePopoverMenu = () => this.setState( { showPopoverMenu: false } );

	// TODO: now that we are reusing URLs we should have a dedicated paths file
	createRestoreUrl = restoreId => `/backups/${ this.props.siteSlug }/restore/${ restoreId }`;
	createDownloadUrl = downloadId => `/backups/${ this.props.siteSlug }/download/${ downloadId }`;

	triggerRestore = () => {
		const restoreId = this.props.activity.rewindId;
		page.redirect( this.createRestoreUrl( restoreId ) );
	};

	triggerDownload = () => {
		const downloadId = this.props.activity.rewindId;
		page.redirect( this.createDownloadUrl( downloadId ) );
	};

	render() {
		const { activity, moment, allowRestore, translate } = this.props;

		return (
			<div className="activity-card">
				<div className="activity-card__time">
					<Gridicon icon="cloud-upload" className="activity-card__time-icon" />
					<div className="activity-card__time-text">
						{ moment( activity.activityDate ).format( 'LT' ) }
					</div>
				</div>
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
					<div className="activity-card__activity-actions">
						<Button compact borderless className="activity-card__detail-button">
							{ translate( 'See content' ) } <Gridicon icon="chevron-down" />
						</Button>
						<Button
							compact
							borderless
							className="activity-card__actions-button"
							ref="popoverMenuButton"
							onClick={ this.togglePopoverMenu }
						>
							{ translate( 'Actions' ) } <Gridicon icon="add" />
						</Button>

						<PopoverMenu
							context={ this.refs && this.refs.popoverMenuButton }
							isVisible={ this.state.showPopoverMenu }
							onClose={ this.closePopoverMenu }
							position="left"
							className="activity-card__popover"
						>
							<Button onClick={ this.triggerRestore } className="activity-card__restore-button">
								{ translate( 'Restore to this point' ) }
							</Button>
							<Button
								borderless
								compact
								isPrimary={ false }
								onClick={ this.triggerDownload }
								className="activity-card__download-button"
							>
								<Gridicon icon="arrow-down" />
								{ translate( 'Download backup' ) }
							</Button>
						</PopoverMenu>
					</div>
				</Card>
			</div>
		);
	}
}

export default localize( ActivityCard );
