import {
	isAutomatticianQuery,
	userSettingsMutation,
	userSettingsQuery,
} from '@automattic/api-queries';
import { FormInputValidation, Dialog, FormLabel } from '@automattic/components';
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
import wpcom from 'calypso/lib/wp';
import { SectionHeader } from '../../components/section-header';
import type { UserSettings } from '@automattic/api-core';
import type { Field, Form } from '@wordpress/dataviews';

const ALLOWED_USERNAME_CHARACTERS_REGEX = /^[a-z0-9]+$/;
const USERNAME_MIN_LENGTH = 4;

function debounceFunction< T extends ( ...args: any[] ) => any >(
	func: T,
	delay: number
): ( ...args: Parameters< T > ) => void {
	let timeoutId: NodeJS.Timeout;
	return ( ...args: Parameters< T > ) => {
		clearTimeout( timeoutId );
		timeoutId = setTimeout( () => func( ...args ), delay );
	};
}

interface ValidationResult {
	success?: boolean;
	error?: string;
	message?: string;
	allowed_actions?: Record< string, string >;
	validatedUsername?: string;
}

interface PersonalDetailsSectionProps {
	profile: UserSettings;
}

export default function PersonalDetailsSection( {
	profile: serverProfile,
}: PersonalDetailsSectionProps ) {
	const { data: userSettings } = useSuspenseQuery( userSettingsQuery() );
	const { data: isAutomattician } = useSuspenseQuery( isAutomatticianQuery() );

	const [ edits, setEdits ] = useState< Partial< UserSettings > >( {} );
	const [ showConfirmDialog, setShowConfirmDialog ] = useState( false );
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

	const hasUsernameChange = edits.user_login && edits.user_login !== currentUsername;

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

	const validateUsername = useCallback(
		debounceFunction( async ( username: string ) => {
			if ( username === currentUsername ) {
				setValidationResult( null );
				return;
			}

			if ( username.length < USERNAME_MIN_LENGTH ) {
				setValidationResult( {
					error: 'invalid_input',
					message: __( 'Usernames must be at least 4 characters.' ),
				} );
				return;
			}

			if ( ! ALLOWED_USERNAME_CHARACTERS_REGEX.test( username ) ) {
				setValidationResult( {
					error: 'invalid_input',
					message: __( 'Usernames can only contain lowercase letters (a-z) and numbers.' ),
				} );
				return;
			}

			try {
				const { success, allowed_actions } = await wpcom.req.get(
					`/me/username/validate/${ username }`
				);

				setValidationResult( { success, allowed_actions, validatedUsername: username } );
			} catch ( error: any ) {
				setValidationResult( error );
			}
		}, 600 ),
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

	const isUsernameValid = () => {
		return validationResult && 'success' in validationResult && validationResult.success === true;
	};

	const getUsernameValidationFailureMessage = () => {
		if ( ! validationResult ) {
			return null;
		}
		return validationResult.message ?? null;
	};

	const getAllowedActions = () => {
		if ( ! validationResult ) {
			return {};
		}
		return validationResult.allowed_actions ?? {};
	};

	const submitUsernameForm = async () => {
		const username = edits.user_login;
		if ( ! username || ! isUsernameValid() ) {
			return;
		}

		const action = usernameAction || 'none';

		setIsSubmittingUsername( true );
		setShowConfirmDialog( false );

		try {
			await wpcom.req.post( '/me/username', { username, action } );

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

	const renderUsernameValidation = useCallback( () => {
		if ( ! hasUsernameChange ) {
			return null;
		}

		const isValid = isUsernameValid();
		const message = getUsernameValidationFailureMessage();

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

	const renderUsernameDescription = useCallback( () => {
		if ( hasUsernameChange ) {
			return null;
		}

		if ( isAutomattician ) {
			return (
				<span className="account-profile-personal-details__username-help">
					{ __( 'Automatticians cannot change their username.' ) }
				</span>
			);
		}

		if ( ! isEmailVerified ) {
			return (
				<span className="account-profile-personal-details__username-help">
					{ __( 'Username can be changed once your email address is verified.' ) }
				</span>
			);
		}

		return null;
	}, [ hasUsernameChange, isAutomattician, isEmailVerified ] );

	const renderBlogActions = useCallback( () => {
		const actions = getAllowedActions();

		if ( Object.keys( actions ).length <= 1 ) {
			return null;
		}

		return (
			<div className="profile-personal-details__blog-actions" style={ { marginTop: '0.75rem' } }>
				<FormLabel>{ __( 'Would you like a matching blog address too?' ) }</FormLabel>
				<VStack spacing={ 1 } style={ { marginTop: '0.5rem' } }>
					{ Object.entries( actions ).map( ( [ key, message ] ) => (
						<label
							key={ key }
							className="profile-personal-details__blog-action"
							style={ { display: 'flex', alignItems: 'center' } }
						>
							<input
								type="radio"
								name="usernameAction"
								value={ key }
								checked={ key === usernameAction }
								onChange={ ( e ) => setUsernameAction( e.target.value ) }
								style={ { marginRight: '0.5rem' } }
							/>
							<span>{ message }</span>
						</label>
					) ) }
				</VStack>
			</div>
		);
	}, [ validationResult, usernameAction ] );

	const renderUsernameConfirmation = useCallback( () => {
		if ( ! hasUsernameChange ) {
			return null;
		}

		const isSaveDisabled =
			userLoginConfirm !== edits.user_login || ! isUsernameValid() || isSubmittingUsername;

		const usernameMatch = userLoginConfirm === edits.user_login && userLoginConfirm.length > 0;
		const message = getUsernameValidationFailureMessage();
		const isError = ! usernameMatch || message;

		let confirmMessage = __( 'Please re-enter your new username to confirm it.' );
		if ( usernameMatch ) {
			confirmMessage = message ? message : __( 'Thanks for confirming your new username!' );
		}

		return (
			<>
				<div style={ { marginTop: '0.5rem' } }>
					<InputControl
						__next40pxDefaultSize
						label={ __( 'Confirm new username' ) }
						id="username_confirm"
						name="username_confirm"
						value={ userLoginConfirm }
						onChange={ ( value ) => setUserLoginConfirm( value || '' ) }
						autoCapitalize="off"
						autoComplete="off"
						autoCorrect="off"
					/>
					<FormInputValidation isError={ !! isError } text={ confirmMessage } />
				</div>

				{ renderBlogActions() }

				<HStack justify="flex-start" style={ { marginTop: '1rem' } }>
					<Button
						variant="primary"
						onClick={ () => setShowConfirmDialog( true ) }
						disabled={ isSaveDisabled }
					>
						{ __( 'Change username' ) }
					</Button>
					<Button variant="secondary" onClick={ cancelUsernameChange }>
						{ __( 'Cancel' ) }
					</Button>
				</HStack>
			</>
		);
	}, [
		hasUsernameChange,
		userLoginConfirm,
		edits.user_login,
		validationResult,
		isSubmittingUsername,
		renderBlogActions,
		cancelUsernameChange,
	] );

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
			id: 'username_validation',
			label: '',
			type: 'text',
			Edit: () => (
				<div>
					{ renderUsernameDescription() }
					{ renderUsernameValidation() }
					{ renderUsernameConfirmation() }
				</div>
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
			'username_validation',
			'user_email',
			'is_dev_account',
		],
	};

	const renderConfirmationDialog = () => {
		return (
			<Dialog
				isVisible={ showConfirmDialog }
				onClose={ () => setShowConfirmDialog( false ) }
				buttons={ [
					{
						action: 'cancel',
						label: __( 'Cancel' ),
						onClick: () => setShowConfirmDialog( false ),
					},
					{
						action: 'confirm',
						label: __( 'Change username' ),
						isPrimary: true,
						additionalClassNames: 'is-scary',
						onClick: submitUsernameForm,
					},
				] }
			>
				<VStack spacing={ 4 }>
					<FormLabel>{ __( 'Confirm username change' ) }</FormLabel>
					<p>
						{ __(
							'You are about to change your username, {{strong}}%(username)s{{/strong}}. ' +
								'Once changed, you will not be able to revert it.'
						)
							.replace( '{{strong}}', '' )
							.replace( '{{/strong}}', '' )
							.replace( '%(username)s', currentUsername ) }{ ' ' }
						{ __(
							'Changing your username will also affect your Gravatar profile and IntenseDebate profile addresses.'
						) }
					</p>
				</VStack>
			</Dialog>
		);
	};

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

			{ renderConfirmationDialog() }
		</>
	);
}
