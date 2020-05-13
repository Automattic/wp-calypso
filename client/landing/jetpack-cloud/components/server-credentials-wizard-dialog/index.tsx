/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { translate } from 'i18n-calypso';
import { isEmpty } from 'lodash';
import { Dialog } from '@automattic/components';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import ServerCredentialsForm from 'landing/jetpack-cloud/components/server-credentials-form';
import getJetpackCredentials from 'state/selectors/get-jetpack-credentials';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	onCloseDialog: Function;
	showDialog: boolean;
	siteId: number;
	children: React.ReactNode;
	buttons: React.ReactNode;
	title: i18nCalypso.TranslateResult;
}

type WizardStep = 'server-credentials' | 'next-step';

const ServerCredentialsWizardDialog = ( {
	onCloseDialog,
	showDialog,
	siteId,
	children,
	buttons,
	title,
}: Props ) => {
	const userHasCredentials = useSelector(
		( state ) => ! isEmpty( getJetpackCredentials( state, siteId, 'main' ) )
	);
	const [ currentStep, setCurrentStep ] = React.useState< WizardStep >(
		userHasCredentials ? 'next-step' : 'server-credentials'
	);
	// const [ currentStep, setCurrentStep ] = React.useState< WizardStep >( 'server-credentials' );

	return (
		<Dialog
			additionalClassNames="server-credentials-wizard-dialog"
			isVisible={ showDialog }
			buttons={ currentStep === 'server-credentials' ? undefined : buttons }
			onClose={ onCloseDialog }
		>
			<h1 className="server-credentials-wizard-dialog__header">{ title }</h1>
			{ currentStep === 'server-credentials' && (
				<>
					<h3 className="server-credentials-wizard-dialog__subheader">
						{ translate( 'You have selected to fix all discovered threats' ) }
					</h3>
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
						</p>
					</div>

					<ServerCredentialsForm
						className="server-credentials-wizard-dialog__form"
						onCancel={ onCloseDialog }
						onComplete={ () => setCurrentStep( 'next-step' ) }
						role="main"
						siteId={ siteId }
						labels={ {
							cancel: translate( 'Go back' ),
							save: translate( 'Save credentials and fix' ),
						} }
					/>
				</>
			) }
			{ currentStep === 'next-step' && children }
		</Dialog>
	);
};

export default ServerCredentialsWizardDialog;
