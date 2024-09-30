import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import * as React from 'react';
import ServerCredentialsWizardDialog from 'calypso/components/jetpack/server-credentials-wizard-dialog';
import ThreatFixHeader from 'calypso/components/jetpack/threat-fix-header';
import { Threat } from 'calypso/components/jetpack/threat-item/types';

import './style.scss';

interface Props {
	threat: Threat;
	action: 'fix' | 'ignore' | 'unignore';
	siteName: string;
	showDialog: boolean;
	onCloseDialog: ( action?: string | React.MouseEvent ) => void;
	onConfirmation: React.MouseEventHandler;
}

const ThreatDialog: React.FC< Props > = ( {
	action,
	onCloseDialog,
	onConfirmation,
	showDialog,
	threat,
} ) => {
	const buttons = React.useMemo( () => {
		let primaryButtonText;
		let isScary;

		switch ( action ) {
			case 'fix':
				primaryButtonText = translate( 'Fix threat' );
				isScary = false;
				break;
			case 'ignore':
				primaryButtonText = translate( 'Ignore threat' );
				isScary = true;
				break;
			case 'unignore':
				primaryButtonText = translate( 'Unignore threat' );
				isScary = true;
				break;
		}

		return [
			<Button className="threat-dialog__btn" onClick={ onCloseDialog }>
				{ translate( 'Go back' ) }
			</Button>,
			<Button primary scary={ isScary } className="threat-dialog__btn" onClick={ onConfirmation }>
				{ primaryButtonText }
			</Button>,
		];
	}, [ action, onCloseDialog, onConfirmation ] );

	const titleProps = React.useMemo( () => {
		let title;
		const titleClassName = `threat-dialog__header--${ action }-threat`;

		switch ( action ) {
			case 'fix':
				title = translate( 'Fix threat' );
				break;
			case 'ignore':
				title = translate( 'Do you really want to ignore this threat?' );
				break;
			case 'unignore':
				title = translate( 'Do you really want to unignore this threat?' );
				break;
		}

		return {
			title,
			titleClassName,
		};
	}, [ action ] );

	return (
		<ServerCredentialsWizardDialog
			showDialog={ showDialog }
			onCloseDialog={ onCloseDialog }
			skipServerCredentials={ action === 'ignore' || action === 'unignore' }
			buttons={ buttons }
			{ ...titleProps }
			baseDialogClassName="threat-dialog"
		>
			<>
				<p>
					{ action === 'fix' && translate( 'Jetpack will fix the threat:' ) }
					{ action === 'ignore' && translate( 'Jetpack will ignore the threat:' ) }
					{ action === 'unignore' && translate( 'Jetpack will unignore the threat:' ) }
				</p>
				<h3 className="threat-dialog__threat-title">
					<ThreatFixHeader threat={ threat } action={ action } />
				</h3>
				{ action === 'ignore' &&
					translate(
						'By ignoring this threat you confirm that you have reviewed the detected code and assume the risks of keeping a potentially malicious file on your site. If you are unsure please request an estimate with Codeable.'
					) }
				{ action === 'unignore' &&
					translate(
						'By unignoring this threat you confirm that you have reviewed the detected code and assume the risks of keeping a potentially malicious file on your site. If you are unsure please request an estimate with Codeable.'
					) }
			</>
		</ServerCredentialsWizardDialog>
	);
};

export default ThreatDialog;
