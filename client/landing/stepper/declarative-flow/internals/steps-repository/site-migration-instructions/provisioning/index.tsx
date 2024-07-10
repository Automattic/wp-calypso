import { Spinner } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { FC } from 'react';
import './style.scss';

export type Status = 'idle' | 'pending' | 'success' | 'error';

interface ProvisioningProps {
	status: {
		siteTransfer: Status;
		pluginInstallation: Status;
		migrationKey: Status;
	};
}

export const Provisioning: FC< ProvisioningProps > = ( { status } ) => {
	const {
		siteTransfer: siteTransferStatus,
		pluginInstallation: pluginInstallationStatus,
		migrationKey: migrationKeyStatus,
	} = status;

	const actions = [
		{ status: siteTransferStatus, text: translate( 'Provisioning your new site' ) },
		{ status: pluginInstallationStatus, text: translate( 'Installing the required plugins' ) },
		{ status: migrationKeyStatus, text: translate( 'Getting the migration key' ) },
	];

	const currentActionIndex = actions.findIndex( ( action ) => action.status !== 'success' );
	const currentAction = actions[ currentActionIndex ];
	if ( ! currentAction || currentAction.status === 'error' ) {
		return;
	}

	return (
		<div className="migration-instructions-provisioning">
			<p className="migration-instructions-provisioning__message">
				{ translate( "Meanwhile, we're preparing everything to ensure your site is ready." ) }
			</p>

			<div className="migration-instructions-provisioning__action">
				<div className="migration-instructions-provisioning__action-icon">
					<Spinner />
				</div>

				<div className="migration-instructions-provisioning__action-text">
					{ currentAction.text }
				</div>

				<div className="migration-instructions-provisioning__action-progress">
					{ currentActionIndex + 1 }/{ actions.length }
				</div>
			</div>
		</div>
	);
};
