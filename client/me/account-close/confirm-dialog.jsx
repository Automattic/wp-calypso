/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import { Dialog, Button } from '@automattic/components';
import FormLabel from 'components/forms/form-label';
import { getCurrentUser } from 'state/current-user/selectors';
import { closeAccount } from 'state/account/actions';

/**
 * Style dependencies
 */
import './confirm-dialog.scss';

class AccountCloseConfirmDialog extends React.Component {
	state = {
		inputValue: '',
	};

	componentDidMount() {
		document.addEventListener( 'keydown', this.handleDialogKeydown );
	}

	componentWillUnmount() {
		document.removeEventListener( 'keydown', this.handleDialogKeydown );
	}

	handleCancel = () => {
		this.props.closeConfirmDialog();
		this.setState( { inputValue: '' } );
	};

	handleInputChange = ( event ) => {
		this.setState( { inputValue: event.target.value.toLowerCase() } );
	};

	handleDialogKeydown = ( event ) => {
		if ( event.key === 'Escape' ) {
			this.handleCancel();
		}
	};

	handleConfirm = () => {
		this.props.closeAccount();
		page( '/me/account/closed' );
	};

	render() {
		const { isVisible, currentUsername, translate } = this.props;
		const isButtonDisabled = currentUsername && this.state.inputValue !== currentUsername;
		const deleteButtons = [
			<Button onClick={ this.handleCancel }>{ translate( 'Cancel' ) }</Button>,
			<Button primary scary disabled={ isButtonDisabled } onClick={ this.handleConfirm }>
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

export default connect(
	( state ) => {
		const user = getCurrentUser( state );

		return {
			currentUsername: user && user.username,
		};
	},
	{
		closeAccount,
	}
)( localize( AccountCloseConfirmDialog ) );
