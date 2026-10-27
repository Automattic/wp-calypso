import { updateUsernameMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useRef, useState, useCallback } from 'react';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { reloadWithFlashMessage } from '../../components/flash-message';
import UsernameUpdateForm from './update-username';
import UsernameUpdateConfirmationModal from './update-username/confirmation-modal';
import {
	validateUsernameDebounced,
	isUsernameValid,
	getUsernameValidationMessage,
	type ValidationResult,
} from './update-username/username-validation-utils';
import { ValidatedTextEdit } from './validated-text-edit';
import type { DataFormControlProps, Field, Form, FormValidity } from '@wordpress/dataviews';

interface UsernameSectionProps {
	value: string;
	onChange: ( value: string | undefined ) => void;
	currentUsername: string;
	isAutomattician: boolean;
	isEmailVerified: boolean;
	canChangeUsername: boolean;
	onCancel: () => void;
}

type UsernameFormData = { user_login?: string };

const UsernameEdit = ( props: DataFormControlProps< UsernameFormData > ) => (
	<ValidatedTextEdit
		{ ...props }
		id="username-input"
		autoCapitalize="off"
		autoComplete="username"
		autoCorrect="off"
	/>
);

const usernameForm: Form = {
	layout: { type: 'regular' },
	fields: [ 'user_login' ],
};

/*
	Username section:
	- Username input field
	- Update username form
	- Confirmation modal
*/
export default function UsernameSection( {
	value,
	onChange,
	currentUsername,
	isAutomattician,
	isEmailVerified,
	canChangeUsername,
	onCancel,
}: UsernameSectionProps ) {
	const [ showConfirmModal, setShowConfirmModal ] = useState( false );
	const [ userLoginConfirm, setUserLoginConfirm ] = useState( '' );
	const [ usernameAction, setUsernameAction ] = useState< string >( 'none' );
	const [ validationResult, setValidationResult ] = useState< ValidationResult | null >( null );
	const [ isValidatingUsername, setIsValidatingUsername ] = useState( false );
	// The username most recently sent for validation, so a slow response for an older value
	// can't overwrite the result for the current one.
	const latestValidatedUsername = useRef< string | null >( null );

	const { mutate: updateUsername, isPending } = useMutation( {
		...withSnackbar( updateUsernameMutation(), {
			error: { source: 'server' },
		} ),
		onSuccess: () => {
			reloadWithFlashMessage( 'username' );
		},
	} );

	const hasUsernameChange = !! ( value && value !== currentUsername );

	const description = useMemo( () => {
		if ( hasUsernameChange ) {
			return undefined;
		}

		if ( isAutomattician ) {
			return __( 'Automatticians cannot change their username.' );
		}

		// New users can't change their username until they've verified their email
		if ( ! isEmailVerified ) {
			return __( 'Username can be changed once your email address is verified.' );
		}

		return undefined;
	}, [ hasUsernameChange, isAutomattician, isEmailVerified ] );

	const validity = useMemo( (): FormValidity => {
		if ( ! hasUsernameChange ) {
			return undefined;
		}

		if ( isValidatingUsername ) {
			return {
				user_login: { custom: { type: 'validating', message: __( 'Checking username…' ) } },
			};
		}

		if ( isUsernameValid( validationResult ) ) {
			return { user_login: { custom: { type: 'valid', message: __( 'Nice username!' ) } } };
		}

		const errorMessage = getUsernameValidationMessage( validationResult );
		if ( errorMessage ) {
			return { user_login: { custom: { type: 'invalid', message: errorMessage } } };
		}

		return undefined;
	}, [ hasUsernameChange, isValidatingUsername, validationResult ] );

	const fields = useMemo(
		(): Field< UsernameFormData >[] => [
			{
				id: 'user_login',
				label: __( 'Username' ),
				type: 'text',
				description,
				isDisabled: isAutomattician || ! isEmailVerified || ! canChangeUsername,
				Edit: UsernameEdit,
			},
		],
		[ description, isAutomattician, isEmailVerified, canChangeUsername ]
	);

	const clearValidation = useCallback( () => {
		latestValidatedUsername.current = null;
		setIsValidatingUsername( false );
		setValidationResult( null );
	}, [] );

	// Event handlers to update the username
	const cancelUsernameChange = useCallback( () => {
		onChange( currentUsername );
		clearValidation();
		setUserLoginConfirm( '' );
		setUsernameAction( 'none' );
		onCancel();
	}, [ onChange, currentUsername, clearValidation, onCancel ] );

	const handleUsernameChange = ( newValue: string | undefined ) => {
		onChange( newValue );

		const lowerCaseValue = ( newValue || '' ).toLowerCase();
		if ( lowerCaseValue !== currentUsername ) {
			setUsernameAction( 'none' );
			latestValidatedUsername.current = lowerCaseValue;
			setIsValidatingUsername( true );
			validateUsernameDebounced( lowerCaseValue, currentUsername, ( result ) => {
				if ( latestValidatedUsername.current !== lowerCaseValue ) {
					return;
				}
				setValidationResult( result );
				setIsValidatingUsername( false );
			} );
		} else {
			// Just clear validation when username matches current, don't fully cancel
			clearValidation();
			setUserLoginConfirm( '' );
			setUsernameAction( 'none' );
		}
	};

	const submitUpdateUsername = async () => {
		setShowConfirmModal( false );

		if ( ! value || ! isUsernameValid( validationResult ) ) {
			return;
		}

		const action = usernameAction || 'none';

		updateUsername( { username: value, action } );
	};

	const formData = useMemo( () => ( { user_login: value || '' } ), [ value ] );

	return (
		<>
			<VStack spacing={ 1 }>
				<DataForm< UsernameFormData >
					data={ formData }
					fields={ fields }
					form={ usernameForm }
					validity={ validity }
					onChange={ ( edits ) => handleUsernameChange( edits.user_login ) }
				/>
			</VStack>

			{ /* Update username form */ }
			<VStack
				role="region"
				aria-label={ __( 'Username confirmation' ) }
				aria-live="polite"
				style={ hasUsernameChange ? {} : { display: 'none' } }
				spacing={ 0 }
			>
				<UsernameUpdateForm
					hasUsernameChange={ hasUsernameChange }
					userLoginConfirm={ userLoginConfirm }
					usernameToConfirm={ value }
					validationResult={ validationResult }
					usernameAction={ usernameAction }
					onConfirmChange={ setUserLoginConfirm }
					onActionChange={ setUsernameAction }
					onShowConfirmModal={ () => setShowConfirmModal( true ) }
					onCancel={ cancelUsernameChange }
					onValidationChange={ setValidationResult }
				/>
			</VStack>

			{ /* Confirmation modal to update username */ }
			<UsernameUpdateConfirmationModal
				isOpen={ showConfirmModal }
				currentUsername={ currentUsername }
				newUsername={ value }
				onConfirm={ submitUpdateUsername }
				onCancel={ () => setShowConfirmModal( false ) }
				isBusy={ isPending }
			/>
		</>
	);
}
