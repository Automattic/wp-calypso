import { Button, Card, FormLabel, Gridicon, ExternalLink } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import ActivityIcon from '../activity-log-item/activity-icon';

import './style.scss';

const ActivityLogConfirmDialog = ( {
	children,
	confirmTitle,
	disableButton,
	icon = 'history',
	notice,
	onClose,
	onConfirm,
	onSettingsChange,
	supportLink,
	title,
} ) => {
	const { __ } = useI18n();

	return (
		<div className="activity-log-item activity-log-item__restore-confirm">
			<div className="activity-log-item__type">
				<ActivityIcon activityIcon={ icon } />
			</div>
			<Card className="activity-log-item__card">
				<h5 className="activity-log-confirm-dialog__title">{ title }</h5>

				<div className="activity-log-confirm-dialog__highlight">{ children }</div>

				<div className="activity-log-confirm-dialog__partial-restore-settings">
					<p>
						{ notice
							? __( 'Choose the items you wish to restore:' )
							: __( 'Choose the items you wish to include in the download:' ) }
					</p>
					<FormLabel>
						<FormCheckbox name="themes" onChange={ onSettingsChange } defaultChecked />
						{ __( 'WordPress Themes' ) }
					</FormLabel>
					<FormLabel>
						<FormCheckbox name="plugins" onChange={ onSettingsChange } defaultChecked />
						{ __( 'WordPress Plugins' ) }
					</FormLabel>
					<FormLabel>
						<FormCheckbox name="uploads" onChange={ onSettingsChange } defaultChecked />
						{ __( 'Media Uploads' ) }
					</FormLabel>
					<FormLabel>
						<FormCheckbox name="roots" onChange={ onSettingsChange } defaultChecked />
						{ __( 'WordPress Root (includes wp-config.php and any non-WordPress files)' ) }
					</FormLabel>
					<FormLabel>
						<FormCheckbox name="contents" onChange={ onSettingsChange } defaultChecked />
						{ __( 'WP-Content Directory (excluding themes, plugins, and uploads)' ) }
					</FormLabel>
					<FormLabel>
						<FormCheckbox name="sqls" onChange={ onSettingsChange } defaultChecked />
						{ __( 'Site Database (SQL)' ) }
					</FormLabel>
				</div>

				{ notice && (
					<div className="activity-log-confirm-dialog__notice">
						<Gridicon icon="notice" />
						<span className="activity-log-confirm-dialog__notice-content">{ notice }</span>
					</div>
				) }

				<div className="activity-log-confirm-dialog__button-wrap">
					<div className="activity-log-confirm-dialog__primary-actions">
						<Button onClick={ onClose }>{ __( 'Cancel' ) }</Button>
						<Button primary disabled={ disableButton } onClick={ onConfirm }>
							{ confirmTitle }
						</Button>
					</div>
					<div className="activity-log-confirm-dialog__secondary-actions">
						<ExternalLink icon href={ supportLink }>
							{ __( 'More info' ) }
						</ExternalLink>
					</div>
				</div>
			</Card>
		</div>
	);
};

export default ActivityLogConfirmDialog;
