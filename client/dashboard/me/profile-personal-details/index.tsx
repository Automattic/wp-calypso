import {
	isAutomatticianQuery,
	userEmailSettingsMutation,
	userSettingsMutation,
	userSettingsQuery,
} from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { useDispatch } from '@wordpress/data';
import { DataForm, Field, Form } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '../../app/auth';
import { NavigationBlocker } from '../../app/navigation-blocker';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { Card, CardBody } from '../../components/card';
import FlashMessage from '../../components/flash-message';
import { SectionHeader } from '../../components/section-header';
import EmailSection from './email-section';
import EmailVerificationBanner from './update-email/email-verification-banner';
import UsernameSection from './username-section';
import type { UserSettings } from '@automattic/api-core';
import './style.scss';

function isEmailFieldError( error: Error ) {
	return (
		'data' in error &&
		typeof error.data === 'object' &&
		error.data !== null &&
		( error.data as Record< string, unknown > )[ 'form-field' ] === 'email'
	);
}

export default function PersonalDetailsSection() {
	const { user } = useAuth();
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	const { data: isAutomattician } = useSuspenseQuery( isAutomatticianQuery() );
	const isMobile = useViewportMatch( 'small', '<' );

	const [ edits, setEdits ] = useState< Partial< UserSettings > >( {} );
	const [ isEmailValid, setIsEmailValid ] = useState< boolean >( true );
	const [ emailSaveError, setEmailSaveError ] = useState< string | null >( null );
	const { createErrorNotice } = useDispatch( noticesStore );

	const success = __( 'Settings saved.' );
	const mutation = useMutation(
		withSnackbar( userSettingsMutation(), { success, error: { source: 'server' } } )
	);
	// Two instances rather than one whose options change with the payload, which a save already
	// in flight would pick up. Errors that concern the email address are shown on the field
	// instead of in a snackbar, so this one reports its own errors.
	const emailMutation = useMutation( {
		...withSnackbar( userEmailSettingsMutation(), { success } ),
		onError: ( error ) => {
			if ( isEmailFieldError( error ) ) {
				setEmailSaveError( error.message );
			} else {
				createErrorNotice( error.message, { type: 'snackbar' } );
			}
		},
	} );

	const data = useMemo( () => ( { ...userSettings, ...edits } ), [ userSettings, edits ] );

	const currentUsername = userSettings.user_login || '';
	const isEmailVerified = user.email_verified;
	const canChangeUsername = userSettings.user_login_can_be_changed ?? true;

	// Form event handlers
	const handleFieldChange = ( partial: Partial< UserSettings > ) => {
		setEdits( ( current ) => ( { ...current, ...partial } ) );
		if ( 'user_email' in partial ) {
			setEmailSaveError( null );
		}
	};

	const handleSubmit = async ( e: React.FormEvent ) => {
		e.preventDefault();

		// Exclude username changes from main form submission
		const { user_login, ...submissionEdits } = edits;

		if ( Object.keys( submissionEdits ).length === 0 ) {
			return;
		}

		if ( 'user_email' in submissionEdits ) {
			emailMutation.mutate( submissionEdits, {
				onSuccess: () => {
					setEdits( {} );
					setEmailSaveError( null );
				},
			} );
			return;
		}

		mutation.mutate( submissionEdits, {
			onSuccess: () => {
				setEdits( {} );
			},
		} );
	};

	const handleUsernameCancel = useCallback( () => {
		setEdits( ( current ) => {
			const { user_login, ...rest } = current;
			return rest;
		} );
	}, [] );

	const isDirty = Object.keys( edits ).some( ( key ) => {
		// Exclude username changes from main form dirty check since they need special handling
		if ( key === 'user_login' ) {
			return false;
		}
		return data[ key as keyof UserSettings ] !== userSettings[ key as keyof UserSettings ];
	} );

	const isSaving = mutation.isPending || emailMutation.isPending;

	// DataForm fields
	const nameFields: Field< UserSettings >[] = [
		{
			id: 'first_name',
			label: __( 'First name' ),
			type: 'text',
		},
		{
			id: 'last_name',
			label: __( 'Last name' ),
			type: 'text',
		},
	];

	const nameForm: Form = {
		layout: {
			type: isMobile ? ( 'regular' as const ) : ( 'row' as const ),
		},
		fields: [ 'first_name', 'last_name' ],
	};

	return (
		// noValidate: the username is saved separately and a bouncing email can still be kept, so an
		// invalid input in either shouldn't block saving the rest of the card.
		<form noValidate onSubmit={ handleSubmit } aria-labelledby="personal-details-heading">
			<FlashMessage id="username" message={ __( 'Username saved.' ) } />
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						<SectionHeader
							level={ 3 }
							title={ __( 'Personal details' ) }
							headingId="personal-details-heading"
						/>

						{ /* Email verification banner */ }
						<EmailVerificationBanner
							userSettings={ userSettings }
							isEmailVerified={ isEmailVerified }
						/>

						<NavigationBlocker shouldBlock={ isDirty } />

						{ /* First & last name */ }
						<DataForm< UserSettings >
							data={ data }
							fields={ nameFields }
							form={ nameForm }
							onChange={ handleFieldChange }
						/>

						{ /* Username */ }
						<UsernameSection
							value={ data.user_login || '' }
							onChange={ ( value ) => handleFieldChange( { user_login: value } ) }
							currentUsername={ currentUsername }
							isAutomattician={ isAutomattician }
							isEmailVerified={ isEmailVerified }
							canChangeUsername={ canChangeUsername }
							onCancel={ handleUsernameCancel }
						/>

						{ /* Email address */ }
						<EmailSection
							value={ data.user_email || '' }
							onChange={ ( value ) => handleFieldChange( { user_email: value } ) }
							disabled={ isSaving }
							userSettings={ userSettings }
							isEmailVerified={ isEmailVerified }
							onValidationChange={ setIsEmailValid }
							serverError={ emailSaveError }
						/>

						<HStack justify="flex-start">
							<Button
								variant="primary"
								type="submit"
								isBusy={ isSaving }
								disabled={ isSaving || ! isDirty || ! isEmailValid }
							>
								{ __( 'Save' ) }
							</Button>
						</HStack>
					</VStack>
				</CardBody>
			</Card>
		</form>
	);
}
