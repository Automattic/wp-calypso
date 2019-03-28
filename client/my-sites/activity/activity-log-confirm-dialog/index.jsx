/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import config from 'config';
import ActivityIcon from '../activity-log-item/activity-icon';
import Button from 'components/button';
import Card from 'components/card';
import FormLabel from 'components/forms/form-label';
import FormCheckbox from 'components/forms/form-checkbox';
import Gridicon from 'gridicons';
import HappychatButton from 'components/happychat/button';
import { recordTracksEvent } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

/* eslint-disable wpcalypso/jsx-classname-namespace */
const ActivityLogConfirmDialog = ( {
	children,
	confirmTitle,
	icon = 'history',
	notice,
	onClose,
	onConfirm,
	onSettingsChange,
	supportLink,
	title,
	translate,
	happychatEvent,
} ) => (
	<div className="activity-log-item activity-log-item__restore-confirm">
		<div className="activity-log-item__type">
			<ActivityIcon activityIcon={ icon } />
		</div>
		<Card className="activity-log-item__card">
			<h5 className="activity-log-confirm-dialog__title">{ title }</h5>

			<div className="activity-log-confirm-dialog__highlight">{ children }</div>

			{ config.isEnabled( 'rewind/partial-restores' ) && (
				<Card className="activity-log-confirm-dialog__partial-restore-settings">
					<p>
						<strong>
							{ notice
								? translate( 'Partial Restore Settings (A8C Only)' )
								: translate( 'Partial Download Settings (A8C Only)' ) }
						</strong>
					</p>
					<p>
						{ notice
							? translate( 'Include the following things in this restore:' )
							: translate( 'Include the following things in this download:' ) }
					</p>
					<FormLabel>
						<FormCheckbox name="themes" onChange={ onSettingsChange } defaultChecked />
						{ translate( 'WordPress Themes' ) }
					</FormLabel>
					<FormLabel>
						<FormCheckbox name="plugins" onChange={ onSettingsChange } defaultChecked />
						{ translate( 'WordPress Plugins' ) }
					</FormLabel>
					<FormLabel>
						<FormCheckbox name="uploads" onChange={ onSettingsChange } defaultChecked />
						{ translate( 'Media Uploads' ) }
					</FormLabel>
					<FormLabel>
						<FormCheckbox name="roots" onChange={ onSettingsChange } defaultChecked />
						{ translate( 'WordPress Root (includes wp-config.php and any non-WordPress files)' ) }
					</FormLabel>
					<FormLabel>
						<FormCheckbox name="contents" onChange={ onSettingsChange } defaultChecked />
						{ translate( 'WP-Content Directory (excluding themes, plugins, and uploads)' ) }
					</FormLabel>
					<FormLabel>
						<FormCheckbox name="sqls" onChange={ onSettingsChange } defaultChecked />
						{ translate( 'Site Database (SQL)' ) }
					</FormLabel>
				</Card>
			) }

			{ notice && (
				<div className="activity-log-confirm-dialog__notice">
					<Gridicon icon={ 'notice' } />
					<span className="activity-log-confirm-dialog__notice-content">{ notice }</span>
				</div>
			) }

			<div className="activity-log-confirm-dialog__button-wrap">
				<div className="activity-log-confirm-dialog__primary-actions">
					<Button onClick={ onClose }>{ translate( 'Cancel' ) }</Button>
					<Button primary onClick={ onConfirm }>
						{ confirmTitle }
					</Button>
				</div>
				<div className="activity-log-confirm-dialog__secondary-actions">
					<Button
						borderless
						className="activity-log-confirm-dialog__more-info-link"
						href={ supportLink }
					>
						<Gridicon icon="notice" />
						<span>{ translate( 'More info' ) }</span>
					</Button>
					<HappychatButton
						className="activity-log-confirm-dialog__more-info-link"
						onClick={ happychatEvent }
					>
						<Gridicon icon="chat" />
						<span>{ translate( 'Any Questions?' ) }</span>
					</HappychatButton>
				</div>
			</div>
		</Card>
	</div>
);
/* eslint-enable wpcalypso/jsx-classname-namespace */

const mapDispatchToProps = {
	happychatEvent: () => recordTracksEvent( 'calypso_activitylog_confirm_dialog' ),
};

export default connect(
	null,
	mapDispatchToProps
)( localize( ActivityLogConfirmDialog ) );
