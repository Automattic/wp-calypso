/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { Button, Dialog } from '@automattic/components';
import { successNotice } from '../../state/notices/actions';
import { recordGoogleEvent } from '../../state/analytics/actions';
import Gridicon from 'components/gridicon';

class Security2faKeyDeleteButton extends Component {
	static propTypes = {
		securityKey: PropTypes.object.isRequired,
	};

	state = {
		showDialog: false,
	};
	buttons = {};

	handleRemoveKeyButtonClick = () => {
		this.buttons = [
			{ action: 'cancel', label: this.props.translate( 'Cancel' ) },
			{
				action: 'delete',
				label: this.props.translate( 'Remove key' ),
				onClick: this.onDeleteKey,
				additionalClassNames: 'is-scary',
			},
		];

		this.setState( { showDialog: ! this.state.showDialog } );
	};

	onCloseDialog = () => {
		this.setState( { showDialog: false } );
	};

	onDeleteKey = ( closeDialog ) => {
		// Actually delete the key
		if ( this.props.onDelete ) {
			this.props.onDelete( this.props.securityKey );
		}
		// Close the dialog
		closeDialog();
	};

	render() {
		return (
			<Fragment>
				<Button
					compact
					className="security-2fa-key__delete-key"
					onClick={ this.handleRemoveKeyButtonClick }
				>
					<Gridicon icon="trash" />
				</Button>
				{ this.state.showDialog && (
					<Dialog
						isVisible={ this.state.showDialog }
						buttons={ this.buttons }
						onClose={ this.onCloseDialog }
					>
						<h1>{ this.props.translate( 'Remove key?' ) }</h1>
						<p>{ this.props.translate( 'Are you sure you want to remove this security key?' ) }</p>
					</Dialog>
				) }
			</Fragment>
		);
	}
}

export default connect(
	null,
	{
		successNotice,
		recordGoogleEvent,
	},
	null
)( localize( Security2faKeyDeleteButton ) );
