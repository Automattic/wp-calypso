/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import Gridicon from 'components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';
import ThreatItemHeader from 'landing/jetpack-cloud/components/threat-item-header';
import ServerCredentialsWizardDialog from 'landing/jetpack-cloud/components/server-credentials-wizard-dialog';
import { Threat } from 'landing/jetpack-cloud/components/threat-item/types';
import { getThreatFix } from 'landing/jetpack-cloud/components/threat-item/utils';

interface Props {
	threat: Threat;
	action: 'fix' | 'ignore';
	siteId: number;
	siteName: string;
	showDialog: boolean;
	onCloseDialog: Function;
	onConfirmation: Function;
}

const ThreatDialog: React.FC< Props > = ( {
	action,
	onCloseDialog,
	onConfirmation,
	siteId,
	siteName,
	showDialog,
	threat,
} ) => {
	const buttons = React.useMemo(
		() => [
			<Button className="threat-dialog__btn" onClick={ onCloseDialog }>
				{ translate( 'Go back' ) }
			</Button>,
			<Button
				primary
				scary={ action !== 'fix' }
				className="threat-dialog__btn"
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
			titleClassName: `threat-dialog__header--${ action }-threat`,
		} ),
		[ action ]
	);

	return (
		<ServerCredentialsWizardDialog
			siteId={ siteId }
			showDialog={ showDialog }
			onCloseDialog={ onCloseDialog }
			buttons={ buttons }
			{ ...titleProps }
			baseDialogClassName={ 'threat-dialog' }
		>
			<>
				<h3 className="threat-dialog__threat-title">{ <ThreatItemHeader threat={ threat } /> }</h3>
				<div className="threat-dialog__threat-description">{ threat.description }</div>
				<div className="threat-dialog__warning">
					<Gridicon
						className={ classnames(
							'threat-dialog__warning-icon',
							`threat-dialog__warning-icon--${ action }-threat`
						) }
						icon="info"
						size={ 36 }
					/>
					<p className="threat-dialog__warning-message">
						{ action === 'fix'
							? getThreatFix( threat.fixable )
							: translate(
									'You shouldn’t ignore a security unless you are absolute sure it’s harmless. If you choose to ignore this threat, it will remain on your site "{{strong}}%s{{/strong}}".',
									{
										args: [ siteName ],
										components: {
											strong: <strong />,
										},
									}
							  ) }
					</p>
				</div>
			</>
		</ServerCredentialsWizardDialog>
	);
};

export default ThreatDialog;
