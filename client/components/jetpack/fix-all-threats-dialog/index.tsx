/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';
import { Button } from '@automattic/components';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import ThreatItemHeader from 'calypso/components/jetpack/threat-item-header';
import ServerCredentialsWizardDialog from 'calypso/components/jetpack/server-credentials-wizard-dialog';
import { FixableThreat } from 'calypso/components/jetpack/threat-item/types';
import { getThreatFix } from 'calypso/components/jetpack/threat-item/utils';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	onCloseDialog: Function;
	onConfirmation: Function;
	showDialog: boolean;
	threats: Array< FixableThreat >;
}

const FixAllThreatsDialog = ( { onConfirmation, onCloseDialog, showDialog, threats }: Props ) => {
	const buttons = React.useMemo(
		() => [
			<Button className="fix-all-threats-dialog__btn" onClick={ onCloseDialog }>
				{ translate( 'Go back' ) }
			</Button>,
			<Button primary className="fix-all-threats-dialog__btn" onClick={ onConfirmation }>
				{ translate( 'Fix all threats' ) }
			</Button>,
		],
		[ onCloseDialog, onConfirmation ]
	);

	return (
		<ServerCredentialsWizardDialog
			showDialog={ showDialog }
			isSingular={ false }
			onCloseDialog={ onCloseDialog }
			title={ translate( 'Fix all threats' ) }
			buttons={ buttons }
		>
			<div className="fix-all-threats-dialog">
				<h3 className="fix-all-threats-dialog__subheader">
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
				<div className="fix-all-threats-dialog__threats-section">
					<Gridicon className="fix-all-threats-dialog__icon" icon="info" size={ 36 } />
					<div className="fix-all-threats-dialog__warning-message">
						{ translate(
							'This is the threat Jetpack will fix:',
							'These are the threats Jetpack will fix:',
							{
								count: threats.length,
							}
						) }
						<ul
							className={ classnames( 'fix-all-threats-dialog__threats', {
								'is-long-list': threats.length > 3,
							} ) }
						>
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
			</div>
		</ServerCredentialsWizardDialog>
	);
};

export default FixAllThreatsDialog;
