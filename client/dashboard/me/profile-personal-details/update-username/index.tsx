import { FormInputValidation, FormLabel } from '@automattic/components';
import {
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import {
	isUsernameValid,
	getUsernameValidationMessage,
	getAllowedActions,
	type ValidationResult,
} from './username-validation-utils';

interface UsernameUpdateFormProps {
	hasUsernameChange: boolean;
	userLoginConfirm: string;
	usernameToConfirm: string | undefined;
	validationResult: ValidationResult | null;
	isSubmittingUsername: boolean;
	usernameAction: string;
	onConfirmChange: ( value: string ) => void;
	onActionChange: ( action: string ) => void;
	onShowConfirmModal: () => void;
	onCancel: () => void;
}

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
	isSubmittingUsername,
	usernameAction,
	onConfirmChange,
	onActionChange,
	onShowConfirmModal,
	onCancel,
}: UsernameUpdateFormProps ) {
	if ( ! hasUsernameChange || ! usernameToConfirm ) {
		return null;
	}

	const isSaveDisabled =
		userLoginConfirm !== usernameToConfirm ||
		! isUsernameValid( validationResult ) ||
		isSubmittingUsername;

	const usernameMatch = userLoginConfirm === usernameToConfirm && userLoginConfirm.length > 0;
	const message = getUsernameValidationMessage( validationResult );
	const isError = ! usernameMatch || message;

	let confirmMessage = __( 'Please re-enter your new username to confirm it.' );
	if ( usernameMatch ) {
		confirmMessage = message ? message : __( 'Thanks for confirming your new username!' );
	}

	const actions = getAllowedActions( validationResult );

	return (
		<>
			<div style={ { marginTop: '0.5rem' } }>
				<InputControl
					__next40pxDefaultSize
					label={ __( 'Confirm new username' ) }
					id="username_confirm"
					name="username_confirm"
					value={ userLoginConfirm }
					onChange={ ( value ) => onConfirmChange( value || '' ) }
					autoCapitalize="off"
					autoComplete="off"
					autoCorrect="off"
				/>
				<FormInputValidation isError={ !! isError } text={ confirmMessage } />
			</div>

			{ Object.keys( actions ).length > 1 && (
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
									onChange={ ( e ) => onActionChange( e.target.value ) }
									style={ { marginRight: '0.5rem' } }
								/>
								<span>{ message }</span>
							</label>
						) ) }
					</VStack>
				</div>
			) }

			<HStack justify="flex-start" style={ { marginTop: '1rem' } }>
				<Button variant="primary" onClick={ onShowConfirmModal } disabled={ isSaveDisabled }>
					{ __( 'Change username' ) }
				</Button>
				<Button variant="secondary" onClick={ onCancel }>
					{ __( 'Cancel' ) }
				</Button>
			</HStack>
		</>
	);
}
