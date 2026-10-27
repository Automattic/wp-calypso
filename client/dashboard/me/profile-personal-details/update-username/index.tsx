import { updateUsernameMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { Button, RadioControl, __experimentalVStack as VStack } from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import { ButtonStack } from '../../../components/button-stack';
import { createValidatedTextEdit } from '../validated-text-edit';
import {
	isUsernameValid,
	getUsernameValidationMessage,
	getAllowedActions,
	type ValidationResult,
} from './username-validation-utils';
import type { Field, Form, FormValidity } from '@wordpress/dataviews';

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

const UsernameConfirmEdit = createValidatedTextEdit< UsernameConfirmFormData >( {
	id: 'username_confirm',
	name: 'username_confirm',
	autoCapitalize: 'off',
	autoComplete: 'off',
	autoCorrect: 'off',
} );

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

	const formData = useMemo(
		() => ( { username_confirm: userLoginConfirm } ),
		[ userLoginConfirm ]
	);

	const actions = getAllowedActions( validationResult );
	const showRadioOptions = Object.keys( actions ).length > 1;

	if ( ! hasUsernameChange || ! usernameToConfirm ) {
		return null;
	}

	const isSaveDisabled =
		userLoginConfirm !== usernameToConfirm || ! isUsernameValid( validationResult ) || isPending;

	const usernameMatch = userLoginConfirm === usernameToConfirm && userLoginConfirm.length > 0;
	const message = getUsernameValidationMessage( validationResult );

	let validity: FormValidity;
	if ( userLoginConfirm.length > 0 && ! usernameMatch ) {
		validity = {
			username_confirm: { custom: { type: 'invalid', message: __( 'Usernames do not match.' ) } },
		};
	} else if ( usernameMatch && message ) {
		validity = { username_confirm: { custom: { type: 'invalid', message } } };
	} else if ( usernameMatch ) {
		validity = {
			username_confirm: {
				custom: { type: 'valid', message: __( 'Thanks for confirming your new username!' ) },
			},
		};
	}

	const fields: Field< UsernameConfirmFormData >[] = [
		{
			id: 'username_confirm',
			label: __( 'Confirm new username' ),
			type: 'text',
			description:
				userLoginConfirm.length === 0
					? __( 'Please re-enter your new username to confirm it.' )
					: undefined,
			Edit: UsernameConfirmEdit,
		},
	];

	return (
		<VStack spacing={ 6 }>
			<DataForm< UsernameConfirmFormData >
				data={ formData }
				fields={ fields }
				form={ usernameConfirmForm }
				validity={ validity }
				onChange={ ( edits ) => onConfirmChange( edits.username_confirm ?? '' ) }
			/>

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
