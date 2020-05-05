import React, { useState, ReactNode } from 'react';
import { Button, TextControl, Icon } from '@wordpress/components';
import { useI18n } from '@automattic/react-i18n';
import { useDispatch, useSelect } from '@wordpress/data';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import { AUTH_STORE } from '../../../stores/auth';
import ModalSubmitButton from '../../modal-submit-button';

interface Props {
	tos: ReactNode;
	errorNotifications: ReactNode;
}

const EnterPasswordForm = ( props: Props ) => {
	const { __ } = useI18n();

	const [ passwordVal, setPasswordVal ] = useState( '' );
	const { reset } = useDispatch( AUTH_STORE );
	const { submitPassword } = useDispatch( AUTH_STORE );
	const usernameOrEmail = useSelect( ( select ) => select( AUTH_STORE ).getUsernameOrEmail() );

	const onSubmitPassword = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		submitPassword( passwordVal );
	};

	const changeEmailAddress = ( e: React.MouseEvent< HTMLElement > ) => {
		reset();
		e.preventDefault;
	};

	const changeEmailOrUsernameLinkText = includes( usernameOrEmail, '@' )
		? __( 'Change Email Address' )
		: __( 'Change Username' );

	return (
		<form onSubmit={ onSubmitPassword }>
			<Button
				className="enter-password__change-username"
				isLink={ true }
				onClick={ changeEmailAddress }
			>
				<Icon icon="arrow-left-alt" size={ 18 } />
				{ changeEmailOrUsernameLinkText }
			</Button>
			<TextControl
				label={ '' }
				value={ usernameOrEmail }
				disabled={ true }
				onChange={ setPasswordVal }
			/>
			<TextControl
				label={ __( 'Password' ) }
				type="password"
				// focusing on the field causes 1password to autofill the password.
				// eslint-disable-next-line
				autoFocus={ true }
				value={ passwordVal }
				onChange={ setPasswordVal }
			/>
			{ props.errorNotifications }
			<div>
				{ props.tos }

				<ModalSubmitButton>{ __( 'Login' ) }</ModalSubmitButton>
			</div>
		</form>
	);
};

export default EnterPasswordForm;
