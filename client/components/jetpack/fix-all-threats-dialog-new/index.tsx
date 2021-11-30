import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { useMemo, useState, useEffect } from 'react';
import ServerCredentialsWizardDialog from 'calypso/components/jetpack/server-credentials-wizard-dialog';
import ThreatFixHeader from 'calypso/components/jetpack/threat-fix-header';
import { FixableThreat } from 'calypso/components/jetpack/threat-item/types';

import './style.scss';

interface Props {
	onCloseDialog: React.MouseEventHandler;
	onConfirmation: React.MouseEventHandler;
	showDialog: boolean;
	threats: Array< FixableThreat >;
}

const FixAllThreatsDialog = ( { onConfirmation, onCloseDialog, showDialog, threats }: Props ) => {
	const [ selectedThreats, setSelectedThreats ] = useState( threats );
	const [ submit, setSubmit ] = useState( false );

	const onSelectCheckbox = ( checked: boolean, threat: Threat ) => {
		if ( checked ) {
			setSelectedThreats( ( state ) => [ ...state, threat ] );
		} else {
			setSelectedThreats( ( state ) => state.filter( ( t ) => t.id !== threat.id ) );
		}
	};

	const fixAll = () => {
		setSubmit( true );
	};

	useEffect( () => {
		if ( submit ) {
			onConfirmation( selectedThreats );
			setSubmit( false );
			setSelectedThreats( threats );
		}
	}, [ submit, selectedThreats ] );

	const buttons = useMemo(
		() => [
			<Button className="fix-all-threats-dialog-new__btn" onClick={ onCloseDialog }>
				{ translate( 'Go back' ) }
			</Button>,
			<Button primary className="fix-all-threats-dialog-new__btn" onClick={ fixAll }>
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
			<div className="fix-all-threats-dialog-new">
				<p className="fix-all-threats-dialog-new__warning-message">
					{ translate( 'Jetpack will be fixing the selected threats and low risk items.' ) }
				</p>
				<div className="fix-all-threats-dialog-new__threats-section">
					{ threats.map( ( threat ) => (
						<div className="fix-all-threats-dialog-new__card-container" key={ threat.id }>
							<ThreatFixHeader
								key={ threat.id }
								threat={ threat }
								fixAllDialog={ true }
								onCheckFix={ onSelectCheckbox }
							/>
						</div>
					) ) }
				</div>
			</div>
		</ServerCredentialsWizardDialog>
	);
};

export default FixAllThreatsDialog;
