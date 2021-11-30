import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import * as React from 'react';
import ServerCredentialsWizardDialog from 'calypso/components/jetpack/server-credentials-wizard-dialog';
import ThreatFixHeader from 'calypso/components/jetpack/threat-fix-header';
import { Threat } from 'calypso/components/jetpack/threat-item-new/types';

import './style.scss';

interface Props {
	threat: Threat;
	action: 'fix' | 'ignore';
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
	const buttons = React.useMemo(
		() => [
			<Button className="threat-dialog-new__btn" onClick={ onCloseDialog }>
				{ translate( 'Go back' ) }
			</Button>,
			<Button
				primary
				scary={ action !== 'fix' }
				className="threat-dialog-new__btn"
				onClick={ onConfirmation }
			>
				{ action === 'fix' ? translate( 'Fix threat' ) : translate( 'Ignore threat' ) }
			</Button>,
		],
		[ action, onCloseDialog, onConfirmation ]
	);

	const titleProps = React.useMemo(
		() => ( {
			title:
				action === 'fix'
					? translate( 'Fix threat' )
					: translate( 'Do you really want to ignore this threat?' ),
			titleClassName: `threat-dialog-new__header--${ action }-threat`,
		} ),
		[ action ]
	);

	const getThreatSeverityText = ( threat ) => {
		if ( threat.severity >= 5 ) {
			return translate( 'critical' );
		}

		if ( threat.severity >= 3 ) {
			return translate( 'high' );
		}

		return translate( 'low' );
	};

	return (
		<ServerCredentialsWizardDialog
			showDialog={ showDialog }
			onCloseDialog={ onCloseDialog }
			skipServerCredentials={ action === 'ignore' }
			buttons={ buttons }
			{ ...titleProps }
			baseDialogClassName={ 'threat-dialog-new' }
		>
			<>
				<p>
					{ translate( 'Jetpack will fix the %(severity)s threat item:', {
						args: { severity: getThreatSeverityText( threat ) },
					} ) }
				</p>
				<h3 className="threat-dialog-new__threat-title">
					{ <ThreatFixHeader threat={ threat } /> }
				</h3>
			</>
		</ServerCredentialsWizardDialog>
	);
};

export default ThreatDialog;
