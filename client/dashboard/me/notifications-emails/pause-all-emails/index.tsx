import { type UserSettings } from '@automattic/api-core';
import { userSettingsMutation, userSettingsQuery } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	CheckboxControl,
	Button,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from 'react';
import { useNotice } from '../../../app/hooks/use-notice';
import { ConfirmationModal } from './confirmation-modal';

const isAllWpcomEmailsDisabled = ( settings: UserSettings ) => {
	return settings.subscription_delivery_email_blocked === true;
};

export const PauseAllEmails = () => {
	const { data: settings } = useSuspenseQuery( userSettingsQuery() );
	const { createSuccessNotice } = useNotice();

	const {
		mutate: updateSettings,
		isPending: isSaving,
		isSuccess,
	} = useMutation( userSettingsMutation() );
	const originalState = isAllWpcomEmailsDisabled( settings );
	const [ isConfirmDialogOpen, setIsConfirmDialogOpen ] = useState( false );
	const [ enabled, setEnabled ] = useState( isAllWpcomEmailsDisabled( settings ) );

	useEffect( () => {
		if ( isSuccess ) {
			const message = enabled ? __( 'All emails paused.' ) : __( 'All emails unpaused.' );
			createSuccessNotice( message, { type: 'snackbar' } );
		}
	}, [ createSuccessNotice, enabled, isSuccess ] );

	useEffect( () => {
		if ( isSaving ) {
			setIsConfirmDialogOpen( false );
		}
	}, [ isSaving ] );

	const handleChange = ( checked: boolean ) => {
		setEnabled( checked );
	};

	const handleConfirmation = () => {
		updateSettings( {
			subscription_delivery_email_blocked: enabled,
		} );
	};

	const askForConfirmation = () => {
		setIsConfirmDialogOpen( true );
	};

	const handleSubmit = ( e: React.FormEvent< HTMLFormElement > ) => {
		e.preventDefault();

		if ( enabled ) {
			askForConfirmation();
		} else {
			handleConfirmation();
		}
	};

	return (
		<>
			{ isConfirmDialogOpen && (
				<ConfirmationModal
					onCancel={ () => setIsConfirmDialogOpen( false ) }
					onConfirm={ handleConfirmation }
				/>
			) }
			<Card>
				<CardBody>
					<form onSubmit={ handleSubmit }>
						<VStack spacing={ 4 } alignment="start">
							<CheckboxControl
								__nextHasNoMarginBottom
								help={ __(
									'Pause all email updates from sites you’re subscribed to on WordPress.com. This includes newsletters from the sites you follow. You can turn them back on anytime.'
								) }
								label={ __( 'Pause all emails' ) }
								checked={ enabled }
								onChange={ handleChange }
								disabled={ isSaving }
							/>
							<Button
								isBusy={ isSaving }
								variant="primary"
								type="submit"
								disabled={ originalState === enabled }
							>
								{ __( 'Save' ) }
							</Button>
						</VStack>
					</form>
				</CardBody>
			</Card>
		</>
	);
};
