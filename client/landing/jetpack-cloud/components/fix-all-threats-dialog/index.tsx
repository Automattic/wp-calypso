/* eslint-disable no-console */
/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';
import { Button, Dialog } from '@automattic/components';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import ServerCredentialsForm from 'landing/jetpack-cloud/components/server-credentials-form';
import { Threat } from 'landing/jetpack-cloud/components/threat-item/types';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	onCloseDialog: Function;
	onConfirmation: Function;
	showDialog: boolean;
	siteId: number;
	threats: Array< Threat >;
	userHasCredentials: boolean;
}

type ProcessStep = 'server-credentials' | 'confirmation';

const FixAllThreatsDialog = ( {
	onConfirmation,
	onCloseDialog,
	showDialog,
	siteId,
	threats,
	userHasCredentials = true,
}: Props ) => {
	const firstStep = userHasCredentials ? 'confirmation' : 'server-credentials';
	const [ currentStep, setCurrentStep ] = React.useState< ProcessStep >( firstStep );

	return (
		<Dialog additionalClassNames="fix-all-threats-dialog" isVisible={ showDialog }>
			<h1 className="fix-all-threats-dialog__header">Fix all threats</h1>
			{ currentStep === 'server-credentials' && (
				<>
					<h3 className="fix-all-threats-dialog__threat-title">
						{ translate( 'You have selected to fix all discovered threats' ) }
					</h3>
					<div className="fix-all-threats-dialog__warning">
						<Gridicon
							className="fix-all-threats-dialog__icon fix-all-threats-dialog__icon--warning"
							icon="info"
							size={ 36 }
						/>
						<p className="fix-all-threats-dialog__warning-message">
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
						className="fix-all-threats-dialog__form"
						onCancel={ onCloseDialog }
						onComplete={ () => setCurrentStep( 'confirmation' ) }
						role="main"
						siteId={ siteId }
						labels={ {
							cancel: translate( 'Go back' ),
							save: translate( 'Save credentials and fix' ),
						} }
					/>
				</>
			) }
			{ currentStep === 'confirmation' && (
				<>
					<h3 className="fix-all-threats-dialog__threat-title">
						{ translate( 'Please confirm you want to fix all %(threatCount)d active threats', {
							args: {
								threatCount: threats.length,
							},
						} ) }
					</h3>
					<p className="fix-all-threats-dialog__warning-message">
						{ translate( 'Jetpack will be fixing all the detected active threats.' ) }
					</p>
					<div className="fix-all-threats-dialog__warning">
						<Gridicon
							className="fix-all-threats-dialog__icon fix-all-threats-dialog__icon--confirmation"
							icon="info"
							size={ 36 }
						/>
						<div className="fix-all-threats-dialog__warning-message">
							{ translate( 'To fix this threat, Jetpack will be:' ) }
							<ul>
								{ threats.map( threat => (
									<li key={ threat.id }>{ threat.title }</li>
								) ) }
							</ul>
						</div>
					</div>
					<div className="fix-all-threats-dialog__buttons">
						{ firstStep !== currentStep && (
							<Button
								className="fix-all-threats-dialog__btn fix-all-threats-dialog__btn--cancel"
								onClick={ () => setCurrentStep( 'server-credentials' ) }
							>
								Go back
							</Button>
						) }
						<Button primary className="fix-all-threats-dialog__btn" onClick={ onConfirmation }>
							Fix all threats
						</Button>
					</div>
				</>
			) }
		</Dialog>
	);
};

export default FixAllThreatsDialog;
