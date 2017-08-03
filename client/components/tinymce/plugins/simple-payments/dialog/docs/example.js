/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import SimplePaymentsDialog from 'components/tinymce/plugins/simple-payments/dialog';
import { getCurrentUser } from 'state/current-user/selectors';

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
