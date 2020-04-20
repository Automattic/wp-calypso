/**
 * External dependencies
 */
import React, { ReactNode } from 'react';
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

interface Props {
	threatTitle: string;
	threatDescription: string | ReactNode;
	action: 'fix' | 'ignore';
	siteName: string;
	showDialog: boolean;
	onCloseDialog: Function;
	onConfirmation: Function;
}

class ThreatDialog extends React.PureComponent< Props > {
	render() {
		const {
			action,
			onCloseDialog,
			onConfirmation,
			siteName,
			showDialog,
			threatDescription,
			threatTitle,
		} = this.props;
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
				<h3 className="threat-dialog__threat-title">{ threatTitle }</h3>
				<div className="threat-dialog__threat-description">{ threatDescription }</div>
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
							? translate(
									'To fix this threat, Jetpack will be deleting the file, since it’s not a part of the original WordPress.'
							  )
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
