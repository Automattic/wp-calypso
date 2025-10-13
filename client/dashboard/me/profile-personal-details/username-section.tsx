import { updateUsernameMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, info, check } from '@wordpress/icons';
import { useState, useCallback } from 'react';
import { Text } from '../../components/text';
import UsernameUpdateForm from './update-username';
import UsernameUpdateConfirmationModal from './update-username/confirmation-modal';
import {
	validateUsernameDebounced,
	isUsernameValid,
	getUsernameValidationMessage,
	type ValidationResult,
} from './update-username/username-validation-utils';

interface UsernameSectionProps {
	value: string;
	onChange: ( value: string | undefined ) => void;
	currentUsername: string;
	isAutomattician: boolean;
	isEmailVerified: boolean;
	canChangeUsername: boolean;
	onCancel: () => void;
}
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

	const { mutate: updateUsername, isPending } = useMutation( {
		...updateUsernameMutation(),
		onSuccess: () => {
			// Reload the page to refresh cookies and user object
			const currentUrl = new URL( window.location.href );
			currentUrl.searchParams.set( 'updated', 'username' );
			window.location.href = currentUrl.toString();
		},
		meta: {
			snackbar: {
				error: __( 'Failed to update username.' ),
			},
		},
	} );

	const hasUsernameChange = !! ( value && value !== currentUsername );

	// Input field helper text
	const getHelpText = useCallback( () => {
		// Static/conditional messages
		if ( ! hasUsernameChange ) {
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
		}

		// Success state
		if ( isUsernameValid( validationResult ) ) {
			return (
				<>
					<Icon icon={ check } size={ 16 } />
					{ __( 'Nice username!' ) }
				</>
			);
		}

		// Error state
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
	}, [ hasUsernameChange, isAutomattician, isEmailVerified, validationResult ] );

	// Event handlers to update the username
	const cancelUsernameChange = useCallback( () => {
		onChange( currentUsername );
		setValidationResult( null );
		setUserLoginConfirm( '' );
		setUsernameAction( 'none' );
		onCancel();
	}, [ onChange, currentUsername, onCancel ] );

	const handleUsernameChange = ( newValue: string | undefined ) => {
		onChange( newValue );

		const lowerCaseValue = ( newValue || '' ).toLowerCase();
		if ( lowerCaseValue !== currentUsername ) {
			setUsernameAction( 'none' );
			validateUsernameDebounced( lowerCaseValue, currentUsername, setValidationResult );
		} else {
			// Just clear validation when username matches current, don't fully cancel
			setValidationResult( null );
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

	return (
		<>
			{ /* Not using DataForm to avoid focus issues on the custom Edit property */ }
			<VStack spacing={ 1 }>
				{ /* Username input field */ }
				<InputControl
					__next40pxDefaultSize
					id="username-input"
					label={ __( 'Username' ) }
					value={ value || '' }
					onChange={ handleUsernameChange }
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
					help={ getHelpText() }
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
