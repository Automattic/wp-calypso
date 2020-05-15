/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';
import classnames from 'classnames';
import { Dialog } from '@automattic/components';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import Gridicon from 'components/gridicon';
import ServerCredentialsForm from 'landing/jetpack-cloud/components/server-credentials-form';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	onCloseDialog: Function;
	showDialog: boolean;
	siteId: number;
	showServerCredentialStep: boolean;
	children: React.ReactNode;
	buttons?: React.ReactNode;
	baseDialogClassName?: string;
	title: i18nCalypso.TranslateResult;
	titleClassName?: string;
	subtitle: i18nCalypso.TranslateResult;
}

const ServerCredentialsWizardDialog = ( {
	onCloseDialog,
	showDialog,
	siteId,
	showServerCredentialStep,
	buttons,
	title,
	titleClassName,
	subtitle,
	baseDialogClassName,
	children,
}: Props ) => {
	return (
		<Dialog
			additionalClassNames={ classnames( 'server-credentials-wizard-dialog', baseDialogClassName ) }
			isVisible={ showDialog }
			buttons={ showServerCredentialStep ? undefined : buttons }
			onClose={ onCloseDialog }
		>
			<h1 className={ classnames( 'server-credentials-wizard-dialog__header', titleClassName ) }>
				{ title }
			</h1>
			{ showServerCredentialStep && (
				<>
					<h3 className="server-credentials-wizard-dialog__subheader">{ subtitle }</h3>
					<div className="server-credentials-wizard-dialog__warning">
						<Gridicon
							className="server-credentials-wizard-dialog__icon server-credentials-wizard-dialog__icon--warning"
							icon="info"
							size={ 36 }
						/>
						<p className="server-credentials-wizard-dialog__warning-message">
							{ translate(
								"Jetpack is unable to auto fix these threats as we currently do not have access to your website's server. Please supply your SFTP/SSH credentials to enable auto fixing. Alternatively, you will need go back and {{strong}}fix the threats manually{{/strong}}.",
								{
									components: {
										strong: <strong />,
									},
								}
							) }
							<br />
						</p>
					</div>

					<ExternalLink
						className="server-credentials-wizard-dialog__link-external"
						icon
						href="https://jetpack.com/support/adding-credentials-to-jetpack/"
					>
						{ translate( 'Need help? Find your server credentials' ) }
					</ExternalLink>

					<ServerCredentialsForm
						className="server-credentials-wizard-dialog__form"
						onCancel={ onCloseDialog }
						role="main"
						siteId={ siteId }
						labels={ {
							cancel: translate( 'Go back' ),
							save: translate( 'Save credentials and fix' ),
						} }
					/>
				</>
			) }
			{ ! showServerCredentialStep && children }
		</Dialog>
	);
};

export default ServerCredentialsWizardDialog;
