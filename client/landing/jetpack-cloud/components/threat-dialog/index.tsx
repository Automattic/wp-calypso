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

interface Props {
	threatId: number;
	threatTitle: string;
	threatDescription: string;
	action: 'fix' | 'ignore';
	showDialog: boolean;
	onCloseDialog: Function;
}

class ThreatDialog extends React.PureComponent< Props > {
	performAction = () => {
		window.alert( `We are going to ${ this.props.action } the threat!` );
		this.props.onCloseDialog();
	};

	render() {
		const { action, onCloseDialog, showDialog, threatDescription, threatTitle } = this.props;
		const buttons = [
			<Button className="threat-dialog__btn threat-dialog__btn--cancel" onClick={ onCloseDialog }>
				{ translate( 'Go back' ) }
			</Button>,
			<Button
				className={ classnames( 'threat-dialog__btn', `threat-dialog__btn--${ action }-threat` ) }
				onClick={ this.performAction }
			>
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
				<p className="threat-dialog__threat-description">{ threatDescription }</p>
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
									'You shouldn’t ignore a security unless you are absolute sure it’s harmless. If you choose to ignore this threat, it will remain on your site: {{strong}}My Jetpack Site{{/strong}}.',
									{
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
