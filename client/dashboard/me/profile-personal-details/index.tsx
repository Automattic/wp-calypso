import {
	isAutomatticianQuery,
	userSettingsMutation,
	userSettingsQuery,
} from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	Button,
	Card,
	CardBody,
	CheckboxControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { Icon, info, check } from '@wordpress/icons';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { SectionHeader } from '../../components/section-header';
import { Text } from '../../components/text';
import { Notice } from '../../components/notice';
import UsernameUpdateForm from './update-username';
import UsernameUpdateConfirmationModal from './update-username/confirmation-modal';
import {
	validateUsernameDebounced,
	isUsernameValid,
	getUsernameValidationMessage,
	submitUsernameChange,
	type ValidationResult,
} from './update-username/username-validation-utils';
import type { UserSettings } from '@automattic/api-core';
import type { Field, Form } from '@wordpress/dataviews';
import './style.scss';

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

	// Conditional help text for username field
	const getUsernameConditionalText = useCallback( () => {
		if ( hasUsernameChange ) {
			return null;
		}

		// Prohibit A12s from changing their username
		if ( isAutomattician ) {
			return (
				<Text className="account-profile-personal-details__username-help">
					{ __( 'Automatticians cannot change their username.' ) }
				</Text>
			);
		}

		// New users can't change their username until they've verified their email
		if ( ! isEmailVerified ) {
			return (
				<Text className="account-profile-personal-details__username-help">
					{ __( 'Username can be changed once your email address is verified.' ) }
				</Text>
			);
		}

		return null;
	}, [ hasUsernameChange, isAutomattician, isEmailVerified ] );

	const getUsernameHelpText = () => {
		const helpText = getUsernameConditionalText();
		if ( helpText ) {
			return helpText;
		}

		if ( ! hasUsernameChange ) {
			return null;
		}

		if ( isUsernameValid( validationResult ) ) {
			return (
				<>
					<Icon icon={ check } size={ 16 } />
					{ __( 'Nice username!' ) }
				</>
			);
		}

		const errorMessage = getUsernameValidationMessage( validationResult );
		if ( errorMessage ) {
			return (
				<>
					<Icon icon={ info } size={ 16 } />
					{ errorMessage }
				</>
			);
		}

		return null;
	};

	// Update username field event handlers
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

	// General form event handlers
	const handleFieldChange = ( partial: Partial< UserSettings > ) => {
		setEdits( ( current ) => ( { ...current, ...partial } ) );

		if ( partial.user_login !== undefined ) {
			const lowerCaseValue = ( partial.user_login || '' ).toLowerCase();
			if ( lowerCaseValue !== currentUsername ) {
				setUsernameAction( 'none' );
				validateUsernameDebounced( lowerCaseValue, currentUsername, setValidationResult );
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
			type: 'regular' as const,
			labelPosition: 'top' as const,
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

	// Confirmation modal to update username
	const renderConfirmationModal = () => (
		<UsernameUpdateConfirmationModal
			isVisible={ showConfirmModal }
			currentUsername={ currentUsername }
			onConfirm={ submitUsernameForm }
			onCancel={ () => setShowConfirmModal( false ) }
		/>
	);

	return (
		<>
			<form onSubmit={ handleSubmit } aria-labelledby="personal-details-heading">
				<Card>
					<CardBody>
						<VStack spacing={ 4 }>
							<SectionHeader
								level={ 3 }
								title={ __( 'Personal details' ) }
								headingId="personal-details-heading"
							/>

							{ /* First & last name */ }
							<DataForm< UserSettings >
								data={ data }
								fields={ nameFields }
								form={ nameForm }
								onChange={ handleFieldChange }
							/>

							{ /* Username - rendered separately to avoid focus issues on DataForm custom Edit */ }
							<VStack spacing={ 1 }>
								<InputControl
									__next40pxDefaultSize
									id="username-input"
									label={ __( 'Username' ) }
									value={ data.user_login || '' }
									onChange={ ( value ) => handleFieldChange( { user_login: value } ) }
									disabled={ isAutomattician || ! isEmailVerified || ! canChangeUsername }
									autoCapitalize="off"
									autoComplete="username"
									autoCorrect="off"
									aria-invalid={
										hasUsernameChange && validationResult && ! isUsernameValid( validationResult )
											? 'true'
											: 'false'
									}
									className={ ( () => {
										if ( ! hasUsernameChange ) {
											return '';
										}
										if ( validationResult && ! isUsernameValid( validationResult ) ) {
											return 'has-error';
										}
										if ( isUsernameValid( validationResult ) ) {
											return 'has-success';
										}
										return '';
									} )() }
									help={ getUsernameHelpText() }
								/>
							</VStack>

							{ /* Update username form */ }
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

							{ /* Email address */ }
							<InputControl
								__next40pxDefaultSize
								id="email-input"
								type="email"
								label={ __( 'Email address' ) }
								value={ data.user_email || '' }
								onChange={ ( value ) => handleFieldChange( { user_email: value } ) }
								autoComplete="email"
								aria-describedby="email-help"
							/>

							{ /* Developer checkbox */ }
							<DataForm< UserSettings >
								data={ data }
								fields={ [ devAccountField ] }
								form={ devForm }
								onChange={ handleFieldChange }
							/>

							{ usernameChangeSuccess && (
								<Notice
									variant="success"
									onClose={ () => setUsernameChangeSuccess( false ) }
									role="status"
									aria-live="polite"
								>
									{ __( 'Username changed successfully!' ) }
								</Notice>
							) }

							{ mutation.error && (
								<Notice variant="error" role="alert" aria-live="assertive">
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
