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
import ThreatItemHeader from 'landing/jetpack-cloud/components/threat-item-header';
import ServerCredentialsForm from 'landing/jetpack-cloud/components/server-credentials-form';
import { FixableThreat } from 'landing/jetpack-cloud/components/threat-item/types';
import { getThreatFix } from 'landing/jetpack-cloud/components/threat-item/utils';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	onCloseDialog: Function;
	onConfirmation: Function;
	showDialog: boolean;
	siteId: number;
	threats: Array< FixableThreat >;
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
						{ translate(
							'Please confirm you want to fix %(numberOfThreats)d active threat',
							'Please confirm you want to fix all %(numberOfThreats)d active threats',
							{
								count: threats.length,
								args: {
									numberOfThreats: threats.length,
								},
							}
						) }
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
							{ translate(
								'This is the threat Jetpack will fix:',
								'These are the threats Jetpack will fix:',
								{
									count: threats.length,
								}
							) }
							<ul className="fix-all-threats-dialog__list">
								{ threats.map( ( threat ) => (
									<li key={ threat.id }>
										<strong>
											<ThreatItemHeader threat={ threat } isStyled={ false } />
										</strong>
										<br />
										{ getThreatFix( threat.fixable ) }
									</li>
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
						{ firstStep === currentStep && (
							<Button
								className="fix-all-threats-dialog__btn fix-all-threats-dialog__btn--cancel"
								onClick={ onCloseDialog }
							>
								{ translate( 'Cancel' ) }
							</Button>
						) }
						<Button primary className="fix-all-threats-dialog__btn" onClick={ onConfirmation }>
							{ translate( 'Fix all threats' ) }
						</Button>
					</div>
				</>
			) }
		</Dialog>
	);
};

export default FixAllThreatsDialog;
