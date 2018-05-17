/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import FormLabel from 'components/forms/form-label';
import Button from 'components/button';

const AccountCloseConfirmDialog = ( {
	isVisible,
	username,
	onConfirm,
	translate,
	closeConfirmDialog,
	deleteAccount,
} ) => {
	const deleteButtons = [
		<Button onClick={ closeConfirmDialog }>{ translate( 'Cancel' ) }</Button>,
		<Button primary scary onClick={ deleteAccount }>
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
			<FormLabel htmlFor="confirmAccountCloseInput" className="account-close__confirm-dialog-label">
				{ translate(
					'Please type {{warn}}%(username)s{{/warn}} in the field below to confirm. ' +
						'Your account will then be gone forever.',
					{
						components: {
							warn: <span className="account-close__confirm-dialog-target-username" />,
						},
						args: {
							username: username,
						},
					}
				) }
			</FormLabel>

			<input
				autoCapitalize="off"
				className="account-close__confirm-dialog-confirm-input"
				type="text"
				onChange={ onConfirm }
				aria-required="true"
				id="confirmAccountCloseInput"
			/>
		</Dialog>
	);
};

AccountCloseConfirmDialog.defaultProps = {
	deleteAccount: noop,
	username: 'yourusername', // @todo connect this to get real username
};

export default localize( AccountCloseConfirmDialog );
