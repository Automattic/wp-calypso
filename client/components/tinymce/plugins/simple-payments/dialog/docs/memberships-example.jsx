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
import Button from 'components/button';
import Card from 'components/card';
import MembershipsDialog from 'components/tinymce/plugins/simple-payments/dialog/memberships';
import { getCurrentUser } from 'state/current-user/selectors';

class MembershipsDialogExample extends PureComponent {
	state = { showDialog: false };

	openDialog = () => this.setState( { showDialog: true } );
	handleClose = () => this.setState( { showDialog: false } );

	render() {
		return (
			<Card>
				<Button onClick={ this.openDialog }>Open Memberships Dialog</Button>
				<MembershipsDialog
					siteId={ this.props.siteId }
					showDialog={ this.state.showDialog }
					onClose={ this.handleClose }
					onInsert={ noop }
				/>
			</Card>
		);
	}
}

const ConnectedMembershipsDialogExample = connect( state => ( {
	siteId: get( getCurrentUser( state ), 'primary_blog' ),
} ) )( MembershipsDialogExample );

ConnectedMembershipsDialogExample.displayName = 'MembershipsDialogExample';

export default ConnectedMembershipsDialogExample;
