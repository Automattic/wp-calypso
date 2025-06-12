import { Button, Dialog } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { useMemo, useState, useEffect } from 'react';
import ThreatFixHeader from 'calypso/components/jetpack/threat-fix-header';
import { FixableThreat, Threat } from 'calypso/components/jetpack/threat-item/types';

import './style.scss';

interface Props {
	onCloseDialog: ( action?: string | undefined ) => void;
	onConfirmation: ( threats: Threat[] ) => void;
	showDialog: boolean;
	threats: Array< FixableThreat >;
}

const FixAllThreatsDialog = ( { onConfirmation, onCloseDialog, showDialog, threats }: Props ) => {
	const [ selectedThreats, setSelectedThreats ] = useState< Threat[] >( threats );
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
			<Button className="fix-all-threats-dialog__btn" onClick={ () => onCloseDialog() }>
				{ translate( 'Go back' ) }
			</Button>,
			<Button primary className="fix-all-threats-dialog__btn" onClick={ fixAll }>
				{ translate( 'Fix all threats' ) }
			</Button>,
		],
		[ onCloseDialog, onConfirmation ]
	);

	return (
		<Dialog isVisible={ showDialog } buttons={ buttons } onClose={ onCloseDialog }>
			<h1>{ translate( 'Fix all threats' ) }</h1>
			<div className="fix-all-threats-dialog">
				<p className="fix-all-threats-dialog__warning-message">
					{ translate( 'Jetpack will be fixing the selected threats and low risk items.' ) }
				</p>
				<div className="fix-all-threats-dialog__threats-section">
					{ threats.map( ( threat ) => (
						<div className="fix-all-threats-dialog__card-container" key={ threat.id }>
							<ThreatFixHeader
								key={ threat.id }
								threat={ threat }
								fixAllDialog
								onCheckFix={ onSelectCheckbox }
								action="fix"
							/>
						</div>
					) ) }
				</div>
			</div>
		</Dialog>
	);
};

export default FixAllThreatsDialog;
