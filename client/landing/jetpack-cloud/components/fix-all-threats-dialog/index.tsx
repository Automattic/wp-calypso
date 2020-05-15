/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { translate } from 'i18n-calypso';
import { isEmpty } from 'lodash';
import { Button } from '@automattic/components';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import ThreatItemHeader from 'landing/jetpack-cloud/components/threat-item-header';
import ServerCredentialsWizardDialog from 'landing/jetpack-cloud/components/server-credentials-wizard-dialog';
import { FixableThreat } from 'landing/jetpack-cloud/components/threat-item/types';
import { getThreatFix } from 'landing/jetpack-cloud/components/threat-item/utils';
import getJetpackCredentials from 'state/selectors/get-jetpack-credentials';

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
}

const FixAllThreatsDialog = ( {
	onConfirmation,
	onCloseDialog,
	showDialog,
	siteId,
	threats,
}: Props ) => {
	const userNeedsCredentials = useSelector( ( state ) =>
		isEmpty( getJetpackCredentials( state, siteId, 'main' ) )
	);

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
			siteId={ siteId }
			showDialog={ showDialog }
			onCloseDialog={ onCloseDialog }
			showServerCredentialStep={ userNeedsCredentials }
			title={ translate( 'Fix all threats' ) }
			subtitle={ translate( 'You have selected to fix all discovered threats' ) }
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
