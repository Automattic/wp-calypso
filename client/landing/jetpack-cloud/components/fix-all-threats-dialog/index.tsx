/* eslint-disable no-console */
/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button, Dialog } from '@automattic/components';
import Gridicon from 'components/gridicon';
import RewindCredentialsForm from 'components/rewind-credentials-form';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	showDialog: boolean;
	onCloseDialog: Function;
}

class FixAllThreatsDialog extends React.PureComponent< Props > {
	fixAll = () => {
		window.alert( `Fixing all threats!` );
		this.props.onCloseDialog();
	};

	render() {
		const { onCloseDialog, showDialog } = this.props;
		const buttons = [
			<Button
				className="fix-all-threats-dialog__btn fix-all-threats-dialog__btn--fix"
				onClick={ onCloseDialog }
			>
				{ translate( 'Go back' ) }
			</Button>,
			<Button onClick={ this.fixAll }>{ translate( 'Save credentials and fix' ) }</Button>,
		];

		return (
			<Dialog
				additionalClassNames="fix-all-threats-dialog"
				isVisible={ showDialog }
				onClose={ onCloseDialog }
				buttons={ buttons }
			>
				<h1 className="fix-all-threats-dialog__header">Fix all threats</h1>
				<h3 className="fix-all-threats-dialog__threat-title">
					{ translate( 'You have selected to fix all discovered threats' ) }
				</h3>
				<div className="fix-all-threats-dialog__warning">
					<Gridicon className="fix-all-threats-dialog__warning-icon" icon="info" size={ 36 } />
					<p className="fix-all-threats-dialog__warning-message">
						{ translate(
							"Jetpack is unable to auto fix these threats as we currently do not have access to your website's server. Please supply your SFTP/SSH credentials to enable auto fixing. Alternatively, you will need go back and {{strong}}fix the threats manually{{/strong}}.",
							{
								components: {
									strong: <strong />,
								},
							}
						) }
					</p>
				</div>
				<RewindCredentialsForm
					allowCancel={ false }
					allowDelete={ false }
					onCancel={ () => console.log( 'Canceled' ) }
					onComplete={ () => console.log( 'Completed' ) }
					role="main"
					siteId={ 28393212 }
				/>
			</Dialog>
		);
	}
}

export default FixAllThreatsDialog;
