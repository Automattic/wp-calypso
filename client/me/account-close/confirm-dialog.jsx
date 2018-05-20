/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import FormLabel from 'components/forms/form-label';
import Button from 'components/button';
import { getCurrentUser } from 'state/current-user/selectors';

class AccountCloseConfirmDialog extends React.Component {
	state = {
		inputValue: '',
	};

	handleInputChange = event => {
		this.setState( { inputValue: event.target.value.toLowerCase() } );
	};

	render() {
		const { isVisible, currentUsername, onConfirm, translate, closeConfirmDialog } = this.props;
		const isButtonDisabled = this.state.inputValue !== currentUsername;
		const deleteButtons = [
			<Button onClick={ closeConfirmDialog }>{ translate( 'Cancel' ) }</Button>,
			<Button primary scary disabled={ isButtonDisabled } onClick={ onConfirm }>
				{ translate( 'Close your account' ) }
			</Button>,
		];

		return (
			<Dialog
				isVisible={ isVisible }
				buttons={ deleteButtons }
				className="account-close__confirm-dialog"
			>
				<h1 className="account-close__confirm-dialog-header">
					{ translate( 'Confirm account closure' ) }
				</h1>
				<FormLabel
					htmlFor="confirmAccountCloseInput"
					className="account-close__confirm-dialog-label"
				>
					{ translate(
						'Please type {{warn}}%(currentUsername)s{{/warn}} in the field below to confirm. ' +
							'Your account will then be gone forever.',
						{
							components: {
								warn: <span className="account-close__confirm-dialog-target-username" />,
							},
							args: {
								currentUsername,
							},
						}
					) }
				</FormLabel>

				<input
					autoCapitalize="off"
					className="account-close__confirm-dialog-confirm-input"
					type="text"
					onChange={ this.handleInputChange }
					value={ this.state.inputValue }
					aria-required="true"
					id="confirmAccountCloseInput"
				/>
			</Dialog>
		);
	}
}

AccountCloseConfirmDialog.defaultProps = {
	onConfirm: noop,
};

export default connect( state => {
	const user = getCurrentUser( state );

	return {
		currentUsername: user && user.username,
	};
} )( localize( AccountCloseConfirmDialog ) );
