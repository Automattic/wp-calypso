/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button, Dialog } from '@automattic/components';
import Gridicon from 'components/gridicon';

/**
 * Style dependencies
 */
import './style.scss';
import ThreatItemHeader from 'landing/jetpack-cloud/components/threat-item-header';
import { Threat } from 'landing/jetpack-cloud/components/threat-item/types';
import { getThreatFix } from 'landing/jetpack-cloud/components/threat-item/utils';

interface Props {
	threat: Threat;
	action: 'fix' | 'ignore';
	siteName: string;
	showDialog: boolean;
	onCloseDialog: Function;
	onConfirmation: Function;
}

class ThreatDialog extends React.PureComponent< Props > {
	render() {
		const { action, onCloseDialog, onConfirmation, siteName, showDialog, threat } = this.props;
		const isScary = action !== 'fix';
		const buttons = [
			<Button className="threat-dialog__btn" onClick={ onCloseDialog }>
				{ translate( 'Go back' ) }
			</Button>,
			<Button primary scary={ isScary } className="threat-dialog__btn" onClick={ onConfirmation }>
				{ action === 'fix' ? translate( 'Fix threat' ) : translate( 'Ignore threat' ) }
			</Button>,
		];

		return (
			<Dialog
				additionalClassNames="threat-dialog"
				isVisible={ showDialog }
				onClose={ onCloseDialog }
				buttons={ buttons }
			>
				<h1
					className={ classnames(
						'threat-dialog__header',
						`threat-dialog__header--${ action }-threat`
					) }
				>
					{ action === 'fix'
						? translate( 'Fix threat' )
						: translate( 'Do you really want to ignore this threat?' ) }
				</h1>
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
									'You shouldn’t ignore a security unless you are absolute sure it’s harmless. If you choose to ignore this threat, it will remain on your site: {{strong}}%s{{/strong}}.',
									{
										args: [ siteName ],
										components: {
											strong: <strong />,
										},
									}
							  ) }
					</p>
				</div>
			</Dialog>
		);
	}
}

export default ThreatDialog;
