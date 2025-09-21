import {
	Button,
	RadioControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalInputControl as InputControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, info, check } from '@wordpress/icons';
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

	const actions = getAllowedActions( validationResult );

	return (
		<VStack spacing={ 3 }>
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
				aria-invalid={ isError ? 'true' : 'false' }
				aria-describedby="username-confirm-help"
				className={ ( () => {
					if ( isError ) {
						return 'has-error';
					}
					if ( usernameMatch && ! hasValidationError ) {
						return 'has-success';
					}
					return '';
				} )() }
				help={ helpText }
			/>

			{ Object.keys( actions ).length > 1 && (
				<RadioControl
					label={ __( 'Would you like a matching blog address too?' ) }
					selected={ usernameAction }
					options={ Object.entries( actions ).map( ( [ value, label ] ) => ( {
						value,
						label,
					} ) ) }
					onChange={ ( value ) => onActionChange( value || 'none' ) }
				/>
			) }

			<HStack justify="flex-start">
				<Button variant="primary" onClick={ onShowConfirmModal } disabled={ isSaveDisabled }>
					{ __( 'Change username' ) }
				</Button>
				<Button variant="secondary" onClick={ onCancel }>
					{ __( 'Cancel' ) }
				</Button>
			</HStack>
		</VStack>
	);
}
