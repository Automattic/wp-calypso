import { updateUsernameMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	FlexBlock,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalInputControlPrefixWrapper as InputControlPrefixWrapper,
	privateApis,
} from '@wordpress/components';
import { useDebounce, useViewportMatch } from '@wordpress/compose';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { useMemo, useRef, useState, useCallback } from 'react';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { reloadWithFlashMessage } from '../../components/flash-message';
import UsernameUpdateForm from './update-username';
import UsernameUpdateConfirmationModal from './update-username/confirmation-modal';
import {
	validateUsernameInternal,
	isUsernameValid,
	getUsernameValidationMessage,
	type ValidationResult,
} from './update-username/username-validation-utils';
import type { DataFormControlProps, Field, Form, FormValidity } from '@wordpress/dataviews';

interface UsernameSectionProps {
	value: string;
	onChange: ( value: string | undefined ) => void;
	currentUsername: string;
	isAutomattician: boolean;
	isEmailVerified: boolean;
	canChangeUsername: boolean;
	onCancel: () => void;
	/** Rendered beside the username input on wide screens, below it on narrow ones. */
	inlineField: React.ReactNode;
}

type UsernameFormData = { user_login?: string };

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/components'
);
const { ValidatedInputControl } = unlock( privateApis );

const UsernameEdit = ( {
	data,
	field,
	onChange,
	validity,
}: DataFormControlProps< UsernameFormData > ) => (
	<ValidatedInputControl
		__next40pxDefaultSize
		id="username-input"
		autoCapitalize="off"
		autoComplete="username"
		autoCorrect="off"
		prefix={ <InputControlPrefixWrapper>@</InputControlPrefixWrapper> }
		customValidity={ validity?.custom }
		label={ field.label }
		help={ field.description }
		value={ field.getValue( { item: data } ) ?? '' }
		onChange={ ( value?: string ) =>
			onChange( field.setValue( { item: data, value: value ?? '' } ) )
		}
		disabled={ field.isDisabled( { item: data, field } ) }
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
	inlineField,
}: UsernameSectionProps ) {
	const isMobile = useViewportMatch( 'small', '<' );
	const [ showConfirmModal, setShowConfirmModal ] = useState( false );
	const [ userLoginConfirm, setUserLoginConfirm ] = useState( '' );
	const [ usernameAction, setUsernameAction ] = useState< string >( 'none' );
	const [ validationResult, setValidationResult ] = useState< ValidationResult | null >( null );
	const validateUsernameDebounced = useDebounce( validateUsernameInternal, 600 );
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

		return __( 'Sign-in and @mentions. Changes can’t be undone.' );
	}, [ hasUsernameChange, isAutomattician, isEmailVerified ] );

	const validity = useMemo( (): FormValidity => {
		if ( ! hasUsernameChange ) {
			return undefined;
		}

		if ( isUsernameValid( validationResult ) ) {
			return { user_login: { custom: { type: 'valid', message: __( 'Nice username!' ) } } };
		}

		const errorMessage = getUsernameValidationMessage( validationResult );
		if ( errorMessage ) {
			return { user_login: { custom: { type: 'invalid', message: errorMessage } } };
		}

		return undefined;
	}, [ hasUsernameChange, validationResult ] );

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
		setValidationResult( null );
	}, [] );

	// Event handlers to update the username
	const cancelUsernameChange = useCallback( () => {
		validateUsernameDebounced.cancel();
		onChange( currentUsername );
		clearValidation();
		setUserLoginConfirm( '' );
		setUsernameAction( 'none' );
		onCancel();
	}, [ validateUsernameDebounced, onChange, currentUsername, clearValidation, onCancel ] );

	const handleUsernameChange = ( newValue: string | undefined ) => {
		onChange( newValue );

		const lowerCaseValue = ( newValue || '' ).toLowerCase();
		if ( lowerCaseValue !== currentUsername ) {
			setUsernameAction( 'none' );
			latestValidatedUsername.current = lowerCaseValue;
			validateUsernameDebounced( lowerCaseValue, currentUsername, ( result ) => {
				if ( latestValidatedUsername.current !== lowerCaseValue ) {
					return;
				}
				setValidationResult( result );
			} );
		} else {
			// Just clear validation when username matches current, don't fully cancel
			validateUsernameDebounced.cancel();
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

	const usernameInput = (
		<DataForm< UsernameFormData >
			data={ formData }
			fields={ fields }
			form={ usernameForm }
			validity={ validity }
			onChange={ ( edits ) => handleUsernameChange( edits.user_login ) }
		/>
	);

	const updateForm = (
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
	);

	const hiddenUntilChanged = hasUsernameChange ? {} : { display: 'none' };

	const updateFormRegion = (
		<VStack
			role="region"
			aria-label={ __( 'Username confirmation' ) }
			aria-live="polite"
			style={ hiddenUntilChanged }
			spacing={ 0 }
		>
			{ updateForm }
		</VStack>
	);

	return (
		<>
			{ isMobile ? (
				<VStack spacing={ 4 }>
					{ usernameInput }
					{ updateFormRegion }
					{ inlineField }
				</VStack>
			) : (
				<VStack spacing={ 4 }>
					<HStack alignment="top" spacing={ 4 }>
						<FlexBlock>{ usernameInput }</FlexBlock>
						<FlexBlock>{ inlineField }</FlexBlock>
					</HStack>
					{ /* Kept to the username column so it lines up with the input above */ }
					<HStack alignment="top" spacing={ 4 } style={ hiddenUntilChanged }>
						<FlexBlock>{ updateFormRegion }</FlexBlock>
						<FlexBlock />
					</HStack>
				</VStack>
			) }

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
