import { isWpError } from '@automattic/api-core';
import {
	isAutomatticianQuery,
	userEmailSettingsMutation,
	userSettingsMutation,
	userSettingsQuery,
} from '@automattic/api-queries';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import {
	BaseControl,
	Button,
	TextareaControl,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { useDispatch } from '@wordpress/data';
import { DataForm, Field, Form, useFormValidity } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState, useMemo, useCallback } from 'react';
import { isValidUrl } from '../../../lib/importer/url-validation';
import { useAuth } from '../../app/auth';
import { NavigationBlocker } from '../../app/navigation-blocker';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { Card, CardBody } from '../../components/card';
import FlashMessage from '../../components/flash-message';
import EditGravatar from './edit-gravatar';
import EmailSection from './email-section';
import EmailVerificationBanner from './update-email/email-verification-banner';
import UsernameSection from './username-section';
import type { UserSettings } from '@automattic/api-core';
import './style.scss';

function isEmailFieldError( error: unknown ) {
	return (
		isWpError( error ) &&
		( error.data as Record< string, unknown > | undefined )?.[ 'form-field' ] === 'email'
	);
}

const fields: Field< UserSettings >[] = [
	{
		id: 'display_name',
		label: __( 'Display name' ),
		type: 'text',
		description: __( 'The name shown on your posts and comments.' ),
		isValid: {
			custom: ( item ) => {
				const value = item.display_name;
				if ( value && value.length > 250 ) {
					return __( 'Display name must be 250 characters or less.' );
				}
				return null;
			},
		},
	},
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
	{
		id: 'user_URL',
		label: __( 'Web address' ),
		type: 'text',
		description: __(
			'Your name links here when you comment. Only on WordPress.com, not on your Gravatar profile.'
		),
		isValid: {
			custom: ( item ) => {
				const value = item.user_URL?.trim();
				if ( value && ! isValidUrl( value ) ) {
					return __( 'Please enter a valid URL.' );
				}
				return null;
			},
		},
	},
	{
		id: 'description',
		label: __( 'About me' ),
		type: 'text',
		Edit: ( { field, data, onChange, hideLabelFromVision } ) => (
			<TextareaControl
				__nextHasNoMarginBottom
				label={ hideLabelFromVision ? '' : field.label }
				help={ __( 'A short bio shown on your public profile.' ) }
				value={ data.description }
				onChange={ ( value: string ) => onChange( { description: value } ) }
			/>
		),
	},
];

const displayNameForm: Form = {
	layout: { type: 'regular' as const, labelPosition: 'top' as const },
	fields: [ 'display_name' ],
};

const bioForm: Form = {
	layout: { type: 'regular' as const, labelPosition: 'top' as const },
	fields: [ 'description', 'user_URL' ],
};

const allFieldsForm: Form = {
	layout: { type: 'regular' as const, labelPosition: 'top' as const },
	fields: fields.map( ( field ) => field.id ),
};

export default function PersonalDetailsSection() {
	const { user } = useAuth();
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	const { data: isAutomattician } = useSuspenseQuery( isAutomatticianQuery() );
	const isMobile = useViewportMatch( 'small', '<' );

	const [ edits, setEdits ] = useState< Partial< UserSettings > >( {} );
	const [ isEmailValid, setIsEmailValid ] = useState< boolean >( true );
	const { createErrorNotice } = useDispatch( noticesStore );
	const queryClient = useQueryClient();

	const success = __( 'Settings saved.' );
	const mutation = useMutation(
		withSnackbar( userSettingsMutation(), { success, error: { source: 'server' } } )
	);
	// Two instances rather than one whose options change with the payload, which a save already
	// in flight would pick up. This one reports its own errors, since those that concern the email
	// address are shown on the field instead of in a snackbar.
	const emailMutation = useMutation( withSnackbar( userEmailSettingsMutation(), { success } ) );

	const data = useMemo( () => ( { ...userSettings, ...edits } ), [ userSettings, edits ] );
	const { validity, isValid } = useFormValidity( data, fields, allFieldsForm );

	// Shown on the field until the rejected address is changed.
	const emailSaveError =
		isEmailFieldError( emailMutation.error ) &&
		emailMutation.variables?.user_email === data.user_email
			? emailMutation.error?.message
			: undefined;

	const currentUsername = userSettings.user_login || '';
	const isEmailVerified = user.email_verified;
	const canChangeUsername = userSettings.user_login_can_be_changed ?? true;

	// Form event handlers
	const handleFieldChange = ( partial: Partial< UserSettings > ) => {
		setEdits( ( current ) => ( { ...current, ...partial } ) );
	};

	const handleSubmit = async ( e: React.FormEvent ) => {
		e.preventDefault();

		// Exclude username changes from main form submission
		const { user_login, ...submissionEdits } = edits;

		if ( Object.keys( submissionEdits ).length === 0 || ! isValid ) {
			return;
		}

		if ( 'user_email' in submissionEdits ) {
			emailMutation.mutate( submissionEdits, {
				onSuccess: () => {
					setEdits( {} );
				},
				onError: ( error ) => {
					if ( isEmailFieldError( error ) ) {
						// Rejecting the address also cancels any email change that was pending.
						queryClient.invalidateQueries( userSettingsQuery() );
					} else {
						createErrorNotice( error.message, { type: 'snackbar' } );
					}
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

	const nameForm: Form = {
		layout: {
			type: isMobile ? ( 'regular' as const ) : ( 'row' as const ),
			labelPosition: 'top' as const,
		},
		fields: [ 'first_name', 'last_name' ],
	};

	return (
		// noValidate: a bouncing email is flagged invalid so DataForm shows its message, but it can
		// still be kept, so it must not block saving. The username is saved separately, so an invalid
		// username input shouldn't block saving the rest of the card either.
		<form noValidate onSubmit={ handleSubmit } aria-label={ __( 'Account details' ) }>
			<FlashMessage id="username" message={ __( 'Username saved.' ) } />
			<Card>
				<CardBody>
					<VStack spacing={ 4 }>
						{ /* Email verification banner */ }
						<EmailVerificationBanner
							userSettings={ userSettings }
							isEmailVerified={ isEmailVerified }
						/>

						<NavigationBlocker shouldBlock={ isDirty } />

						{ /* Avatar */ }
						<BaseControl label={ __( 'Avatar' ) } __nextHasNoMarginBottom>
							<EditGravatar
								avatarUrl={ data.avatar_URL }
								userEmail={ userSettings.user_email }
								isEmailVerified={ isEmailVerified }
							/>
						</BaseControl>

						{ /* First & last name */ }
						<VStack spacing={ 2 }>
							<DataForm< UserSettings >
								data={ data }
								fields={ fields }
								validity={ validity }
								form={ nameForm }
								onChange={ handleFieldChange }
							/>
							<Text variant="muted">
								{ __(
									'Used to fill in forms, such as domain contact details, or whenever we need your official name.'
								) }
							</Text>
						</VStack>

						{ /* Username & display name */ }
						<UsernameSection
							value={ data.user_login || '' }
							onChange={ ( value ) => handleFieldChange( { user_login: value } ) }
							currentUsername={ currentUsername }
							isAutomattician={ isAutomattician }
							isEmailVerified={ isEmailVerified }
							canChangeUsername={ canChangeUsername }
							onCancel={ handleUsernameCancel }
							inlineField={
								<DataForm< UserSettings >
									data={ data }
									fields={ fields }
									validity={ validity }
									form={ displayNameForm }
									onChange={ handleFieldChange }
								/>
							}
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

						{ /* About me & web address */ }
						<DataForm< UserSettings >
							data={ data }
							fields={ fields }
							validity={ validity }
							form={ bioForm }
							onChange={ handleFieldChange }
						/>

						<HStack justify="flex-start">
							<Button
								variant="primary"
								type="submit"
								isBusy={ isSaving }
								disabled={ isSaving || ! isDirty || ! isEmailValid || ! isValid }
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
