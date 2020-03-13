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

class IgnoreThreatDialog extends React.PureComponent< Props > {
	performAction = () => {
		window.alert( `We are going to ${ this.props.action } the threat!` );
		this.props.onCloseDialog();
	};

	render() {
		const { action, onCloseDialog, showDialog, threatDescription, threatTitle } = this.props;
		const buttons = [
			<Button className="ignore-threat__btn ignore-threat__btn--cancel" onClick={ onCloseDialog }>
				{ translate( 'Go Back' ) }
			</Button>,
			<Button
				className={ classnames( 'ignore-threat__btn', `ignore-threat__btn--${ action }-threat` ) }
				onClick={ this.performAction }
			>
				{ action === 'fix' ? translate( 'Fix threat' ) : translate( 'Ignore Threat' ) }
			</Button>,
		];

		return (
			<Dialog
				additionalClassNames="ignore-threat"
				isVisible={ showDialog }
				onClose={ onCloseDialog }
				buttons={ buttons }
			>
				<h1
					className={ classnames(
						'ignore-threat__header',
						`ignore-threat__header--${ action }-threat`
					) }
				>
					{ action === 'fix'
						? translate( 'Fix threat' )
						: translate( 'Do you really want to ignore this threat?' ) }
				</h1>
				<h3 className="ignore-threat__threat-title">{ threatTitle }</h3>
				<p className="ignore-threat__threat-description">{ threatDescription }</p>
				<div className="ignore-threat__warning">
					<Gridicon
						className={ classnames(
							'ignore-threat__warning-icon',
							`ignore-threat__warning-icon--${ action }-threat`
						) }
						icon="info"
						size={ 36 }
					/>
					<p className="ignore-threat__warning-message">
						{ action === 'fix'
							? translate(
									'To fix this threat, Jetpack will be deleting the file, since it’s not a part of the original WordPress.'
							  )
							: translate(
									'You shouldn’t ignore a security unless you are absolute sure it’s harmless. If you choose to ignore this threat, it will remain on your site: My Jetpack Site.'
							  ) }
					</p>
				</div>
			</Dialog>
		);
	}
}

export default IgnoreThreatDialog;
