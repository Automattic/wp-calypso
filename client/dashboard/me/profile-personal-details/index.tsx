import {
	isAutomatticianQuery,
	userEmailSettingsMutation,
	userSettingsMutation,
	userSettingsQuery,
} from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	BaseControl,
	Button,
	TextareaControl,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { DataForm, Field, Form, useFormValidity } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
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

const fields: Field< UserSettings >[] = [
	{
		id: 'display_name',
		label: __( 'Display name' ),
		type: 'text',
		description: __(
			'The name everyone sees: on your posts, comments, and profile. You can change it any time.'
		),
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
		description: __( 'A link to your website. Your name links to it on comments you leave.' ),
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

const profileForm: Form = {
	layout: { type: 'regular' as const, labelPosition: 'top' as const },
	fields: [ 'user_URL', 'description' ],
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

	const snackbar = { success: __( 'Settings saved.' ), error: { source: 'server' as const } };
	const mutation = useMutation( withSnackbar( userSettingsMutation(), snackbar ) );
	// Two instances rather than one whose options change with the payload, which a save already
	// in flight would pick up.
	const emailMutation = useMutation( withSnackbar( userEmailSettingsMutation(), snackbar ) );

	const data = useMemo( () => ( { ...userSettings, ...edits } ), [ userSettings, edits ] );
	const { validity, isValid } = useFormValidity( data, fields, allFieldsForm );

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

		const save = 'user_email' in submissionEdits ? emailMutation : mutation;
		save.mutate( submissionEdits, {
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
		<form onSubmit={ handleSubmit } aria-label={ __( 'Account details' ) }>
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

						{ /* Profile photo */ }
						<BaseControl label={ __( 'Profile photo' ) } __nextHasNoMarginBottom>
							<EditGravatar
								avatarUrl={ data.avatar_URL }
								userEmail={ userSettings.user_email }
								isEmailVerified={ isEmailVerified }
							/>
						</BaseControl>

						{ /* Email address */ }
						<EmailSection
							value={ data.user_email || '' }
							onChange={ ( value ) => handleFieldChange( { user_email: value } ) }
							disabled={ isSaving }
							userSettings={ userSettings }
							isEmailVerified={ isEmailVerified }
							onValidationChange={ setIsEmailValid }
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

						{ /* Display name */ }
						<DataForm< UserSettings >
							data={ data }
							fields={ fields }
							validity={ validity }
							form={ displayNameForm }
							onChange={ handleFieldChange }
						/>

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
									'Only used where a formal name is needed, such as your contact details when you buy a domain. Not shown on your posts or comments.'
								) }
							</Text>
						</VStack>

						{ /* Web address & about me */ }
						<DataForm< UserSettings >
							data={ data }
							fields={ fields }
							validity={ validity }
							form={ profileForm }
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
