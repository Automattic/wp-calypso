/* eslint-disable no-console */
/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import Gridicon from 'components/gridicon';
import ServerCredentialsForm from '../server-credentials-form';

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

		return (
			<Dialog
				additionalClassNames="fix-all-threats-dialog"
				isVisible={ showDialog }
				onClose={ onCloseDialog }
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
				<ServerCredentialsForm
					className="fix-all-threats-dialog__form"
					onCancel={ () => console.log( 'Canceled' ) }
					onComplete={ () => console.log( 'Completed' ) }
					role="main"
					siteId={ 28393212 }
					labels={ {
						cancel: translate( 'Go back' ),
						save: translate( 'Save credentials and fix' ),
					} }
				/>
			</Dialog>
		);
	}
}

export default FixAllThreatsDialog;
