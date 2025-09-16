import { type UserSettings } from '@automattic/api-core';
import { userSettingsMutation, userSettingsQuery } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	Card,
	CardBody,
	CheckboxControl,
	Button,
	__experimentalVStack as VStack,
	__experimentalConfirmDialog as ConfirmDialog,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from 'react';
import { useNotice } from '../../../app/hooks/use-notice';

const isAllWpcomEmailsDisabled = ( settings: UserSettings ) => {
	return settings.subscription_delivery_email_blocked === true;
};

export const PauseAllEmails = () => {
	const [ enabled, setEnabled ] = useState( false );
	const { data: settings } = useSuspenseQuery( userSettingsQuery() );
	const { createSuccessNotice } = useNotice();

	const {
		mutate: updateSettings,
		isPending: isSaving,
		isSuccess,
	} = useMutation( userSettingsMutation() );
	const originalState = isAllWpcomEmailsDisabled( settings );

	const [ isConfirmDialogOpen, setIsConfirmDialogOpen ] = useState(
		isAllWpcomEmailsDisabled( settings )
	);

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
			<ConfirmDialog
				onConfirm={ handleConfirmation }
				onRequestClose={ () => setIsConfirmDialogOpen( false ) }
				isOpen={ isConfirmDialogOpen }
				confirmButtonText={ __( 'Yes, I want to pause all emails' ) }
				cancelButtonText={ __( 'Cancel' ) }
				title={ __( 'Are you sure you want to pause all emails?' ) }
				style={ { maxWidth: '480px' } }
			>
				<h3>{ __( 'Are you sure you want to pause all emails?' ) }</h3>
				<p>
					{ __(
						'If you have active newsletter subscriptions, pausing emails means you won’t receive updates from them.'
					) }
				</p>
			</ConfirmDialog>
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
