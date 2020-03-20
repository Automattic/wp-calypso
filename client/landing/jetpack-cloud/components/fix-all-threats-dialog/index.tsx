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
	showDialog: boolean;
	siteId: number;
	threats: Array< Threat >;
}

type ProcessStep = 'server-credentials' | 'confirmation';

const FixAllThreatsDialog = ( { onCloseDialog, showDialog, siteId, threats }: Props ) => {
	const [ step, setStep ] = React.useState< ProcessStep >( 'server-credentials' );

	return (
		<Dialog
			additionalClassNames="fix-all-threats-dialog"
			isVisible={ showDialog }
			onClose={ onCloseDialog }
		>
			<h1 className="fix-all-threats-dialog__header">Fix all threats</h1>
			{ step === 'server-credentials' && (
				<>
					<h3 className="fix-all-threats-dialog__threat-title">
						{ translate( 'You have selected to fix all discovered threats' ) }
					</h3>
					<div className="fix-all-threats-dialog__warning">
						<Gridicon className="fix-all-threats-dialog__warning-icon" icon="info" size={ 36 } />
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
						onComplete={ () => setStep( 'confirmation' ) }
						role="main"
						siteId={ siteId }
						labels={ {
							cancel: translate( 'Go back' ),
							save: translate( 'Save credentials and fix' ),
						} }
					/>
				</>
			) }
			{ step === 'confirmation' && (
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
						<Gridicon className="fix-all-threats-dialog__warning-icon" icon="info" size={ 36 } />
						<div className="fix-all-threats-dialog__warning-message">
							{ translate( 'To fix this threat, Jetpack will be:' ) }
							<ul>
								{ threats.map( threat => (
									<li>{ threat.title }</li>
								) ) }
							</ul>
						</div>
					</div>
					<div>
						<Button>Go back</Button>
						<Button>Fix all threats</Button>
					</div>
				</>
			) }
		</Dialog>
	);
};

export default FixAllThreatsDialog;
