import { Button, Spinner } from '@wordpress/components';
import { Icon, closeSmall, check } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import { FC, ReactNode } from 'react';
import { recordMigrationInstructionsLinkClick } from '../tracking';
import './style.scss';

export type Status = 'idle' | 'pending' | 'success' | 'error';

interface ProvisionStatusProps {
	status: {
		siteTransfer: Status;
		migrationKey: string;
		pluginInstallation?: Status;
	};

	navigateToDoItForMe: () => void;
}

export const ProvisionStatus: FC< ProvisionStatusProps > = ( { status, navigateToDoItForMe } ) => {
	const {
		siteTransfer: siteTransferStatus,
		migrationKey: migrationKeyStatus,
		pluginInstallation: pluginInstallationStatus,
	} = status;

	const preparationCompleted =
		siteTransferStatus === 'success' && pluginInstallationStatus === 'success';

	if ( preparationCompleted ) {
		const text =
			migrationKeyStatus === 'error'
				? translate(
						'Your new site is ready! Retrieve your migration key and enter it into your old site to start your migration.'
				  )
				: translate(
						'Your new site is ready! Enter your migration key into your old site to start your migration.'
				  );
		return (
			<div className="migration-instructions-provisioning">
				<div className="migration-instructions-provisioning__success">
					<div className="migration-instructions-provisioning__success-icon">
						<Icon icon={ check } />
					</div>
					<p>{ text }</p>
				</div>
			</div>
		);
	}

	const actions = [
		{ status: siteTransferStatus, text: translate( 'Provisioning your new site' ) },
		{ status: pluginInstallationStatus, text: translate( 'Installing the required plugins' ) },
		{ status: migrationKeyStatus, text: translate( 'Getting the migration key' ) },
	].filter( ( action ) => action.status );

	const currentActionIndex = actions.findIndex( ( action ) => action.status !== 'success' );
	const currentAction = actions[ currentActionIndex ];
	if ( ! currentAction ) {
		return;
	}

	let text: ReactNode = translate( "We're preparing everything to ensure your new site is ready." );
	let icon = <Spinner />;

	// Error handler.
	if ( currentAction.status === 'error' ) {
		const contactClickHandler = () => {
			recordMigrationInstructionsLinkClick( 'error-contact-support' );
			navigateToDoItForMe();
		};

		text = translate(
			'Sorry, there was a problem setting up your site. {{button}}Let us take it from here{{/button}}.',
			{
				components: {
					button: (
						<Button
							className="migration-instructions-provisioning__difm-link"
							variant="link"
							onClick={ contactClickHandler }
						/>
					),
				},
			}
		);
		icon = (
			<div className="migration-instructions-provisioning__action-icon-error">
				<Icon icon={ closeSmall } />
			</div>
		);
	}

	return (
		<div className="migration-instructions-provisioning">
			<p className="migration-instructions-provisioning__message">{ text }</p>

			<div className="migration-instructions-provisioning__action">
				<div className="migration-instructions-provisioning__action-icon">{ icon }</div>

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
