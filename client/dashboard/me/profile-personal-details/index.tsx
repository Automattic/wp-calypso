import {
	isAutomatticianQuery,
	userSettingsMutation,
	userSettingsQuery,
} from '@automattic/api-queries';
import { FormInputValidation } from '@automattic/components';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	Button,
	Card,
	CardBody,
	CheckboxControl,
	Notice,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useState, useCallback, useEffect } from 'react';
import { SectionHeader } from '../../components/section-header';
import UsernameUpdateConfirmationModal from './update-username/confirmation-modal';
import UsernameUpdateForm from './update-username';
import {
	createUsernameValidator,
	isUsernameValid,
	getUsernameValidationMessage,
	submitUsernameChange,
	type ValidationResult,
} from './update-username/username-validation-utils';
import type { UserSettings } from '@automattic/api-core';
import type { Field, Form } from '@wordpress/dataviews';

interface PersonalDetailsSectionProps {
	profile: UserSettings;
}

export default function PersonalDetailsSection( {
	profile: serverProfile,
}: PersonalDetailsSectionProps ) {
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	const { data: isAutomattician } = useSuspenseQuery( isAutomatticianQuery() );

	const [ edits, setEdits ] = useState< Partial< UserSettings > >( {} );
	const [ showConfirmModal, setShowConfirmModal ] = useState( false );
	const [ userLoginConfirm, setUserLoginConfirm ] = useState( '' );
	const [ usernameAction, setUsernameAction ] = useState< string >( 'none' );
	const [ validationResult, setValidationResult ] = useState< ValidationResult | null >( null );
	const [ usernameChangeSuccess, setUsernameChangeSuccess ] = useState( false );
	const [ isSubmittingUsername, setIsSubmittingUsername ] = useState( false );

	const mutation = useMutation( userSettingsMutation() );
	const data = useMemo( () => ( { ...serverProfile, ...edits } ), [ serverProfile, edits ] );

	const currentUsername = userSettings?.user_login || '';
	const isEmailVerified = userSettings?.email_verified ?? true;
	const canChangeUsername = userSettings?.user_login_can_be_changed ?? true;

	const hasUsernameChange = !! ( edits.user_login && edits.user_login !== currentUsername );

	useEffect( () => {
		const params = new URLSearchParams( window.location.search );
		if ( params.get( 'usernameChangeSuccess' ) === 'true' ) {
			setUsernameChangeSuccess( true );
			const currentUrl = new URL( window.location.href );
			currentUrl.searchParams.delete( 'usernameChangeSuccess' );
			window.history.replaceState( {}, '', currentUrl.toString() );

			setEdits( ( current ) => {
				const { user_login, ...rest } = current;
				return rest;
			} );
			setValidationResult( null );
			setUserLoginConfirm( '' );
		}
	}, [] );

	const validateUsername = useMemo(
		() => createUsernameValidator( currentUsername, setValidationResult ),
		[ currentUsername ]
	);

	const cancelUsernameChange = useCallback( () => {
		setEdits( ( current ) => {
			const { user_login, ...rest } = current;
			return rest;
		} );
		setValidationResult( null );
		setUserLoginConfirm( '' );
		setUsernameAction( 'none' );
	}, [] );

	const submitUsernameForm = async () => {
		const username = edits.user_login;
		if ( ! username || ! isUsernameValid( validationResult ) ) {
			return;
		}

		const action = usernameAction || 'none';

		setIsSubmittingUsername( true );
		setShowConfirmModal( false );

		try {
			await submitUsernameChange( username, action );

			// Reload the page to refresh cookies and user object
			const currentUrl = new URL( window.location.href );
			currentUrl.searchParams.set( 'usernameChangeSuccess', 'true' );
			window.location.href = currentUrl.toString();
		} catch ( error: any ) {
			setIsSubmittingUsername( false );
			setValidationResult( error );
		}
	};

	const handleFieldChange = ( partial: Partial< UserSettings > ) => {
		setEdits( ( current ) => ( { ...current, ...partial } ) );

		if ( partial.user_login !== undefined ) {
			const lowerCaseValue = ( partial.user_login || '' ).toLowerCase();
			if ( lowerCaseValue !== currentUsername ) {
				setUsernameAction( 'none' );
				validateUsername( lowerCaseValue );
			} else {
				cancelUsernameChange();
			}
		}
	};

	const handleSubmit = async ( e: React.FormEvent ) => {
		e.preventDefault();

		const { user_login, ...otherEdits } = edits;

		if ( Object.keys( otherEdits ).length === 0 ) {
			return;
		}

		mutation.mutate( otherEdits, {
			onSuccess: () => {
				setEdits( ( current ) => {
					const { user_login } = current;
					return user_login ? { user_login } : {};
				} );
			},
		} );
	};

	const isDirty = Object.keys( edits )
		.filter( ( key ) => key !== 'user_login' )
		.some( ( key ) => {
			return data?.[ key as keyof UserSettings ] !== serverProfile?.[ key as keyof UserSettings ];
		} );

	const isSaving = mutation.isPending || isSubmittingUsername;

	const getUsernameHelpText = useCallback( () => {
		if ( hasUsernameChange ) {
			return null;
		}

		// Prohibit A12s from changing their username
		if ( isAutomattician ) {
			return (
				<span className="account-profile-personal-details__username-help">
					{ __( 'Automatticians cannot change their username.' ) }
				</span>
			);
		}

		// New users can't change their username until they've verified their email
		if ( ! isEmailVerified ) {
			return (
				<span className="account-profile-personal-details__username-help">
					{ __( 'Username can be changed once your email address is verified.' ) }
				</span>
			);
		}

		return null;
	}, [ hasUsernameChange, isAutomattician, isEmailVerified ] );

	const renderUsernameValidation = useCallback( () => {
		if ( ! hasUsernameChange ) {
			return null;
		}

		const isValid = isUsernameValid( validationResult );
		const message = getUsernameValidationMessage( validationResult );

		if ( ! isValid && message === null ) {
			return null;
		}

		return (
			<FormInputValidation
				isError={ ! isValid }
				text={ isValid ? __( 'Nice username!' ) : message || '' }
			/>
		);
	}, [ hasUsernameChange, validationResult ] );

	const fields: Field< UserSettings >[] = [
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
			id: 'user_login',
			label: __( 'Username' ),
			type: 'text',
			Edit: ( { data, field, onChange, hideLabelFromVision } ) => (
				// TODO: Replace with ValidatedTextControl
				<InputControl
					__next40pxDefaultSize
					label={ field.label }
					value={ data.user_login || '' }
					onChange={ ( value ) => onChange( { user_login: value } ) }
					disabled={ isAutomattician || ! isEmailVerified || ! canChangeUsername }
					hideLabelFromVision={ hideLabelFromVision }
					autoCapitalize="off"
					autoComplete="off"
					autoCorrect="off"
				/>
			),
		},
		{
			id: 'username_confirmation',
			label: '',
			type: 'text',
			Edit: () => (
				<VStack spacing={ 2 }>
					{ getUsernameHelpText() }
					{ renderUsernameValidation() }
					<UsernameUpdateForm
						hasUsernameChange={ hasUsernameChange }
						userLoginConfirm={ userLoginConfirm }
						usernameToConfirm={ edits.user_login }
						validationResult={ validationResult }
						isSubmittingUsername={ isSubmittingUsername }
						usernameAction={ usernameAction }
						onConfirmChange={ setUserLoginConfirm }
						onActionChange={ setUsernameAction }
						onShowConfirmModal={ () => setShowConfirmModal( true ) }
						onCancel={ cancelUsernameChange }
					/>
				</VStack>
			),
		},
		{
			id: 'user_email',
			label: __( 'Email address' ),
			type: 'email',
			Edit: ( { field, data, onChange, hideLabelFromVision } ) => (
				<InputControl
					__next40pxDefaultSize
					type="email"
					label={ hideLabelFromVision ? '' : field.label }
					value={ data.user_email || '' }
					onChange={ ( value ) => onChange( { user_email: value } ) }
				/>
			),
		},
		{
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
		},
	];

	const form: Form = {
		layout: {
			type: 'regular' as const,
			labelPosition: 'top' as const,
		},
		fields: [
			'first_name',
			'last_name',
			'user_login',
			'username_confirmation',
			'user_email',
			'is_dev_account',
		],
	};

	const renderConfirmationModal = () => (
		<UsernameUpdateConfirmationModal
			isVisible={ showConfirmModal }
			currentUsername={ currentUsername }
			currentUserDisplayName={ userSettings?.display_name || '' }
			onConfirm={ submitUsernameForm }
			onCancel={ () => setShowConfirmModal( false ) }
		/>
	);

	return (
		<>
			<form onSubmit={ handleSubmit }>
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<SectionHeader level={ 3 } title={ __( 'Personal details' ) } />

							<DataForm< UserSettings >
								data={ data }
								fields={ fields }
								form={ form }
								onChange={ handleFieldChange }
							/>

							{ usernameChangeSuccess && (
								<Notice
									status="success"
									isDismissible
									onDismiss={ () => setUsernameChangeSuccess( false ) }
								>
									{ __( 'Username changed successfully!' ) }
								</Notice>
							) }

							{ mutation.error && (
								<Notice status="error" isDismissible={ false }>
									{ ( mutation.error as Error ).message }
								</Notice>
							) }

							{ ! hasUsernameChange && (
								<HStack justify="flex-start">
									<Button
										variant="primary"
										type="submit"
										isBusy={ isSaving }
										disabled={ isSaving || ! isDirty }
									>
										{ __( 'Save' ) }
									</Button>
								</HStack>
							) }
						</VStack>
					</CardBody>
				</Card>
			</form>

			{ renderConfirmationModal() }
		</>
	);
}
