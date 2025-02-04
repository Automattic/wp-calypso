/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReactModal from 'react-modal';
import { BACKUP_RETENTION_UPDATE_REQUEST } from 'calypso/state/rewind/retention/constants';
import RetentionConfirmationDialog from '../index';

ReactModal.setAppElement( '*' ); // suppresses modal-related test warnings.

describe( 'RetentionConfirmationDialog', () => {
	test( 'should show proper message when retention is 2 days and submitted', () => {
		render(
			<RetentionConfirmationDialog
				confirmationDialogVisible
				retentionSelected={ 2 }
				updateRetentionRequestStatus={ BACKUP_RETENTION_UPDATE_REQUEST.SUBMITTED }
				onClose={ jest.fn() }
				onConfirmation={ jest.fn() }
			/>
		);
		expect( screen.getByText( 'Update settings' ) ).toBeInTheDocument();
		// Confirm button should say Confirm change
		expect( screen.getByText( 'Confirm change' ) ).toBeInTheDocument();
		expect(
			screen.getByText(
				'You are about to reduce the number of days your backups are being saved. Backups older than 2 days will be lost.'
			)
		).toBeInTheDocument();
	} );
	test( 'should show proper message when retention is 7 days and submitted', () => {
		render(
			<RetentionConfirmationDialog
				confirmationDialogVisible
				retentionSelected={ 7 }
				updateRetentionRequestStatus={ BACKUP_RETENTION_UPDATE_REQUEST.SUBMITTED }
				onClose={ jest.fn() }
				onConfirmation={ jest.fn() }
			/>
		);
		expect( screen.getByText( 'Update settings' ) ).toBeInTheDocument();
		// Confirm button should say Confirm change
		expect( screen.getByText( 'Confirm change' ) ).toBeInTheDocument();
		expect(
			screen.getByText(
				'You are about to reduce the number of days your backups are being saved. Backups older than 7 days will be lost.'
			)
		).toBeInTheDocument();
	} );
	test( 'should show spinner in confirm button when retention update is pending', () => {
		render(
			<RetentionConfirmationDialog
				confirmationDialogVisible
				retentionSelected={ 7 }
				updateRetentionRequestStatus={ BACKUP_RETENTION_UPDATE_REQUEST.PENDING }
				onClose={ jest.fn() }
				onConfirmation={ jest.fn() }
			/>
		);
		expect( screen.getByText( 'Update settings' ) ).toBeInTheDocument();
		// Confirm button should not say Confirm change instead show a spinner.
		expect( screen.queryByText( 'Confirm change' ) ).not.toBeInTheDocument();
		expect(
			screen.getByText(
				'You are about to reduce the number of days your backups are being saved. Backups older than 7 days will be lost.'
			)
		).toBeInTheDocument();
	} );
	test( 'should call confirmation callback when confirm is clicked', async () => {
		const confirmationCallback = jest.fn();
		render(
			<RetentionConfirmationDialog
				confirmationDialogVisible
				retentionSelected={ 7 }
				updateRetentionRequestStatus={ BACKUP_RETENTION_UPDATE_REQUEST.UNSUBMITTED }
				onClose={ jest.fn() }
				onConfirmation={ confirmationCallback }
			/>
		);
		// get confirm button.
		const confirmButton = screen.queryByText( 'Confirm change' );

		// click on the button.
		await userEvent.click( confirmButton );

		// check if callback has been called.
		expect( confirmationCallback ).toHaveBeenCalledTimes( 1 );
	} );
	test( 'should call cancel callback when cancel button is clicked', async () => {
		const cancelCallback = jest.fn();
		render(
			<RetentionConfirmationDialog
				confirmationDialogVisible
				retentionSelected={ 7 }
				updateRetentionRequestStatus={ BACKUP_RETENTION_UPDATE_REQUEST.UNSUBMITTED }
				onClose={ cancelCallback }
				onConfirmation={ jest.fn() }
			/>
		);
		// get confirm button.
		const cancelButton = screen.queryByText( 'Cancel' );

		// click on the button.
		await userEvent.click( cancelButton );

		// check if callback has been called.
		expect( cancelCallback ).toHaveBeenCalledTimes( 1 );
	} );
	test( 'dialog should not be visible if false is passed', () => {
		render(
			<RetentionConfirmationDialog
				confirmationDialogVisible={ false }
				retentionSelected={ 7 }
				updateRetentionRequestStatus={ BACKUP_RETENTION_UPDATE_REQUEST.UNSUBMITTED }
				onClose={ jest.fn() }
				onConfirmation={ jest.fn() }
			/>
		);
		expect( screen.queryByText( 'Update settings' ) ).not.toBeInTheDocument();
	} );
} );
