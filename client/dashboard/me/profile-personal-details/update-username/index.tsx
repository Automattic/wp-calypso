import { updateUsernameMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	Button,
	RadioControl,
	__experimentalVStack as VStack,
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { Icon, info, check } from '@wordpress/icons';
import { createContext, useContext } from 'react';
import { ButtonStack } from '../../../components/button-stack';
import {
	isUsernameValid,
	getUsernameValidationMessage,
	getAllowedActions,
	type ValidationResult,
} from './username-validation-utils';
import type { DataFormControlProps, Field, Form } from '@wordpress/dataviews';
import type { ReactNode } from 'react';

interface UsernameUpdateFormProps {
	hasUsernameChange: boolean;
	userLoginConfirm: string;
	usernameToConfirm: string | undefined;
	validationResult: ValidationResult | null;
	usernameAction: string;
	onConfirmChange: ( value: string ) => void;
	onActionChange: ( action: string ) => void;
	onShowConfirmModal: () => void;
	onCancel: () => void;
	onValidationChange: ( result: ValidationResult | null ) => void;
}

type UsernameConfirmFormData = { username_confirm: string };

const UsernameConfirmFieldContext = createContext< {
	help: ReactNode;
	className: string;
	isInvalid: boolean;
} >( { help: null, className: '', isInvalid: false } );

function UsernameConfirmEdit( {
	data,
	field,
	onChange,
}: DataFormControlProps< UsernameConfirmFormData > ) {
	const { help, className, isInvalid } = useContext( UsernameConfirmFieldContext );
	return (
		<InputControl
			__next40pxDefaultSize
			label={ field.label }
			id="username_confirm"
			name="username_confirm"
			value={ data.username_confirm }
			onChange={ ( value?: string ) => onChange( { username_confirm: value ?? '' } ) }
			autoCapitalize="off"
			autoComplete="off"
			autoCorrect="off"
			aria-invalid={ isInvalid ? 'true' : 'false' }
			aria-describedby="username-confirm-help"
			className={ className }
			help={ help }
		/>
	);
}

const usernameConfirmFields: Field< UsernameConfirmFormData >[] = [
	{
		id: 'username_confirm',
		label: __( 'Confirm new username' ),
		type: 'text',
		Edit: UsernameConfirmEdit,
	},
];

const usernameConfirmForm: Form = {
	layout: { type: 'regular' },
	fields: [ 'username_confirm' ],
};

/*
	Form that appears when trying to update your username:
		- Input field to confirm new username
		- Radio button options to create a new site with the new username
		- Submit/cancel buttons
*/
export default function UsernameUpdateForm( {
	hasUsernameChange,
	userLoginConfirm,
	usernameToConfirm,
	validationResult,
	usernameAction,
	onConfirmChange,
	onActionChange,
	onShowConfirmModal,
	onCancel,
	onValidationChange,
}: UsernameUpdateFormProps ) {
	const { isPending } = useMutation( updateUsernameMutation() );

	const cancelUsernameChange = () => {
		onValidationChange( null );
		onCancel();
	};

	const actions = getAllowedActions( validationResult );
	const showRadioOptions = Object.keys( actions ).length > 1;

	if ( ! hasUsernameChange || ! usernameToConfirm ) {
		return null;
	}

	const isSaveDisabled =
		userLoginConfirm !== usernameToConfirm || ! isUsernameValid( validationResult ) || isPending;

	const usernameMatch = userLoginConfirm === usernameToConfirm && userLoginConfirm.length > 0;
	const message = getUsernameValidationMessage( validationResult );
	const hasValidationError = message && usernameMatch;
	const hasConfirmError = userLoginConfirm.length > 0 && ! usernameMatch;
	const isError = hasConfirmError || hasValidationError;

	let helpText = null;
	if ( userLoginConfirm.length === 0 ) {
		helpText = __( 'Please re-enter your new username to confirm it.' );
	} else if ( hasConfirmError ) {
		helpText = (
			<>
				<Icon icon={ info } size={ 16 } />
				{ __( 'Usernames do not match.' ) }
			</>
		);
	} else if ( hasValidationError ) {
		helpText = message ? (
			<>
				<Icon icon={ info } size={ 16 } />
				{ message }
			</>
		) : null;
	} else if ( usernameMatch ) {
		helpText = (
			<>
				<Icon icon={ check } size={ 16 } />
				{ __( 'Thanks for confirming your new username!' ) }
			</>
		);
	}

	let className = '';
	if ( isError ) {
		className = 'has-error';
	} else if ( usernameMatch && ! hasValidationError ) {
		className = 'has-success';
	}

	return (
		<VStack spacing={ 6 }>
			<UsernameConfirmFieldContext.Provider
				value={ { help: helpText, className, isInvalid: !! isError } }
			>
				<DataForm< UsernameConfirmFormData >
					data={ { username_confirm: userLoginConfirm } }
					fields={ usernameConfirmFields }
					form={ usernameConfirmForm }
					onChange={ ( edits ) => onConfirmChange( edits.username_confirm ?? '' ) }
				/>
			</UsernameConfirmFieldContext.Provider>

			{ showRadioOptions && (
				<VStack spacing={ 3 }>
					<RadioControl
						label={ __( 'Would you like a matching blog address too?' ) }
						selected={ usernameAction }
						options={ Object.entries( actions ).map( ( [ value, label ] ) => ( {
							value,
							label,
						} ) ) }
						onChange={ ( value ) => onActionChange( value || 'none' ) }
					/>
				</VStack>
			) }

			<ButtonStack justify="flex-start">
				<Button variant="primary" onClick={ onShowConfirmModal } disabled={ isSaveDisabled }>
					{ __( 'Change username' ) }
				</Button>
				<Button variant="secondary" onClick={ cancelUsernameChange }>
					{ __( 'Cancel' ) }
				</Button>
			</ButtonStack>
		</VStack>
	);
}
