import { updateUsernameMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { Icon, info, check } from '@wordpress/icons';
import { createContext, useContext, useMemo, useState, useCallback } from 'react';
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
import type { DataFormControlProps, Field, Form } from '@wordpress/dataviews';
import type { ReactNode } from 'react';

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

const UsernameFieldContext = createContext< {
	help: ReactNode;
	className: string;
	isInvalid: boolean;
	disabled: boolean;
} >( { help: null, className: '', isInvalid: false, disabled: false } );

function UsernameEdit( { data, field, onChange }: DataFormControlProps< UsernameFormData > ) {
	const { help, className, isInvalid, disabled } = useContext( UsernameFieldContext );
	return (
		<InputControl
			__next40pxDefaultSize
			id="username-input"
			label={ field.label }
			value={ data.user_login ?? '' }
			onChange={ ( newValue?: string ) => onChange( { user_login: newValue } ) }
			disabled={ disabled }
			autoCapitalize="off"
			autoComplete="username"
			autoCorrect="off"
			aria-invalid={ isInvalid ? 'true' : 'false' }
			className={ className }
			help={ help }
		/>
	);
}

const usernameFields: Field< UsernameFormData >[] = [
	{
		id: 'user_login',
		label: __( 'Username' ),
		type: 'text',
		Edit: UsernameEdit,
	},
];

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

	const { mutate: updateUsername, isPending } = useMutation( {
		...withSnackbar( updateUsernameMutation(), {
			error: { source: 'server' },
		} ),
		onSuccess: () => {
			reloadWithFlashMessage( 'username' );
		},
	} );

	const hasUsernameChange = !! ( value && value !== currentUsername );

	// Input field helper text
	const getHelpText = useCallback( () => {
		// Static/conditional messages
		if ( ! hasUsernameChange ) {
			if ( isAutomattician ) {
				return __( 'Automatticians cannot change their username.' );
			}

			// New users can't change their username until they've verified their email
			if ( ! isEmailVerified ) {
				return __( 'Username can be changed once your email address is verified.' );
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

	const isInvalid =
		hasUsernameChange && !! validationResult && ! isUsernameValid( validationResult );
	const getValidationClass = () => {
		if ( ! hasUsernameChange ) {
			return '';
		}
		if ( isInvalid ) {
			return 'has-error';
		}
		if ( isUsernameValid( validationResult ) ) {
			return 'has-success';
		}
		return '';
	};

	const formData = useMemo( () => ( { user_login: value || '' } ), [ value ] );
	const help = getHelpText();
	const className = getValidationClass();
	const disabled = isAutomattician || ! isEmailVerified || ! canChangeUsername;
	const fieldContext = { help, className, isInvalid, disabled };

	return (
		<>
			<VStack spacing={ 1 }>
				<UsernameFieldContext.Provider value={ fieldContext }>
					<DataForm< UsernameFormData >
						data={ formData }
						fields={ usernameFields }
						form={ usernameForm }
						onChange={ ( edits ) => handleUsernameChange( edits.user_login ) }
					/>
				</UsernameFieldContext.Provider>
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
