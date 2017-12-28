/** @format */

/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { get, noop } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'client/components/button';
import Card from 'client/components/card';
import SimplePaymentsDialog from 'client/components/tinymce/plugins/simple-payments/dialog';
import { getCurrentUser } from 'client/state/current-user/selectors';

class SimplePaymentsDialogExample extends PureComponent {
	state = { showDialog: false };

	openDialog = () => this.setState( { showDialog: true } );
	handleClose = () => this.setState( { showDialog: false } );

	render() {
		return (
			<Card>
				<Button onClick={ this.openDialog }>Open Simple Payments Dialog</Button>
				<SimplePaymentsDialog
					siteId={ this.props.siteId }
					showDialog={ this.state.showDialog }
					onClose={ this.handleClose }
					onInsert={ noop }
				/>
			</Card>
		);
	}
}

const ConnectedSimplePaymentsDialogExample = connect( state => ( {
	siteId: get( getCurrentUser( state ), 'primary_blog' ),
} ) )( SimplePaymentsDialogExample );

ConnectedSimplePaymentsDialogExample.displayName = 'SimplePaymentsDialogExample';

export default ConnectedSimplePaymentsDialogExample;
