import {
	isAutomatticianQuery,
	userSettingsMutation,
	userSettingsQuery,
} from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	Button,
	CheckboxControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { DataForm, Field, Form } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState, useMemo, useCallback } from 'react';
import { NavigationBlocker } from '../../app/navigation-blocker';
import { Card, CardBody } from '../../components/card';
import FlashMessage from '../../components/flash-message';
import { SectionHeader } from '../../components/section-header';
import EmailSection from './email-section';
import EmailVerificationBanner from './update-email/email-verification-banner';
import UsernameSection from './username-section';
import type { UserSettings } from '@automattic/api-core';
import './style.scss';

interface PersonalDetailsSectionProps {
	profile: UserSettings;
}

export default function PersonalDetailsSection( {
	profile: serverProfile,
}: PersonalDetailsSectionProps ) {
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	const { data: isAutomattician } = useSuspenseQuery( isAutomatticianQuery() );
	const isMobile = useViewportMatch( 'small', '<' );

	const [ edits, setEdits ] = useState< Partial< UserSettings > >( {} );
	const [ isEmailValid, setIsEmailValid ] = useState< boolean >( true );

	const mutation = useMutation( {
		...userSettingsMutation(),
		meta: {
			snackbar: {
				success: __( 'Settings saved.' ),
				error: __( 'Failed to save settings.' ),
			},
		},
	} );

	const data = useMemo( () => ( { ...serverProfile, ...edits } ), [ serverProfile, edits ] );

	const currentUsername = userSettings?.user_login || '';
	const isEmailVerified = userSettings?.email_verified ?? true;
	const canChangeUsername = userSettings?.user_login_can_be_changed ?? true;

	// Form event handlers
	const handleFieldChange = ( partial: Partial< UserSettings > ) => {
		setEdits( ( current ) => ( { ...current, ...partial } ) );
	};

	const handleSubmit = async ( e: React.FormEvent ) => {
		e.preventDefault();

		// Exclude username changes from main form submission
		const { user_login, ...submissionEdits } = edits;

		if ( Object.keys( submissionEdits ).length === 0 ) {
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
		return data?.[ key as keyof UserSettings ] !== serverProfile?.[ key as keyof UserSettings ];
	} );

	const isSaving = mutation.isPending;

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

	const devAccountField: Field< UserSettings > = {
		id: 'is_dev_account',
		label: __( 'I am a developer' ),
		type: 'boolean',
		description: __( 'Opt in to previews of new developer-focused features.' ),
		Edit: ( { field, onChange, data, hideLabelFromVision } ) => {
			const { id, getValue, description } = field;
			return (
				<CheckboxControl
					__nextHasNoMarginBottom
					label={ hideLabelFromVision ? '' : field.label }
					help={ description }
					checked={ getValue( { item: data } ) }
					onChange={ () => onChange( { [ id ]: ! getValue( { item: data } ) } ) }
				/>
			);
		},
	};

	const nameForm: Form = {
		layout: {
			type: isMobile ? ( 'regular' as const ) : ( 'row' as const ),
		},
		fields: [ 'first_name', 'last_name' ],
	};

	const devForm: Form = {
		layout: {
			type: 'regular' as const,
			labelPosition: 'top' as const,
		},
		fields: [ 'is_dev_account' ],
	};

	return (
		<form onSubmit={ handleSubmit } aria-labelledby="personal-details-heading">
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
						<EmailVerificationBanner userData={ userSettings } />

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
							userData={ userSettings }
							onValidationChange={ setIsEmailValid }
						/>

						{ /* Developer checkbox */ }
						<DataForm< UserSettings >
							data={ data }
							fields={ [ devAccountField ] }
							form={ devForm }
							onChange={ handleFieldChange }
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
