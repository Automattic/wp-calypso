import { Notice, Spinner } from '@wordpress/components';
import { Icon, check } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import { recordMigrationInstructionsLinkClick } from '../tracking';
import type { ComponentProps, FC, MouseEvent } from 'react';
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

	if ( currentAction.status !== 'error' ) {
		return (
			<div className="migration-instructions-provisioning">
				<p className="migration-instructions-provisioning__message">
					{ translate( "We're preparing everything to ensure your new site is ready." ) }
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
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const contactClickHandler = ( event: MouseEvent< HTMLButtonElement > ) => {
		recordMigrationInstructionsLinkClick( 'error-contact-support' );
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const requestDifmClickHandler = ( event: MouseEvent< HTMLButtonElement > ) => {
		recordMigrationInstructionsLinkClick( 'error-request-difm' );
		navigateToDoItForMe();
	};

	const noticeActions = [
		{
			label: translate( 'Contact support' ),
			onClick: contactClickHandler,
			variant: 'primary',
		},
		{
			label: translate( 'Let us migrate your site' ),
			onClick: requestDifmClickHandler,
			variant: 'tertiary',
			// Ensure we use the tertiary variant - onClick defaults to a secondary button
			noDefaultClasses: true,
		},
	] as ComponentProps< typeof Notice >[ 'actions' ];

	return (
		<Notice
			status="warning"
			actions={ noticeActions }
			className="migration-instructions-provisioning__error"
			isDismissible={ false }
			politeness="assertive"
		>
			{ translate( 'Sorry, there was a problem setting up your site.' ) }
		</Notice>
	);
};
