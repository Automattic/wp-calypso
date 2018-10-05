/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { successNotice } from "../../state/notices/actions";
import { recordGoogleEvent } from "../../state/analytics/actions";
import Dialog from 'components/dialog'


class U2FKeyDeleteButton extends React.Component {

	state = {
		showDialog: false
	};
	buttons = {};

	handleRemoveKeyButtonClick = () => {
		this.buttons = [
			{ action: 'cancel', label: this.props.translate( 'Cancel' ) },
			{
				action: 'delete',
				label: this.props.translate( 'Remove key' ),
				onClick: this.onDeleteKey,
				additionalClassNames: 'is-scary'
			},
		];

		this.setState( { showDialog: ! this.state.showDialog } )
	};

	onCloseDialog = () => {
		this.setState( { showDialog: false } )
	};

	onDeleteKey = (closeDialog) => {
		// Actually delete the key
		//console.log(this.props);
		// Close the dialog
		closeDialog();
	};


	render() {
		return (
			<div>
				<Button
					borderless
					className="security-u2f-key__delete-key"
					onClick={this.handleRemoveKeyButtonClick}
				>
					<Gridicon icon="cross"/>
				</Button>
				{ this.state.showDialog &&
					<Dialog
						isVisible={this.state.showDialog}
						buttons={this.buttons}
						onClose={this.onCloseDialog}
					>
						<h1>{this.props.translate( 'Remove key?' )}</h1>
						<p>{this.props.translate( 'Are you sure you want to remove this security key?' )}</p>
					</Dialog>
				}
			</div>
		)
	}
}

export default connect(
	null,
	{
		successNotice,
		recordGoogleEvent,
	},
	null,
)( localize( U2FKeyDeleteButton ) );

