import React, { useState, ReactNode } from 'react';
import { TextControl } from '@wordpress/components';
import { useI18n } from '@automattic/react-i18n';
import { useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { AUTH_STORE } from '../../../stores/auth';
import ModalSubmitButton from '../../modal-submit-button';

interface Props {
	tos: ReactNode;
	errorNotifications: ReactNode;
}

const EnterUsernameOrEmailForm = ( props: Props ) => {
	const { __: NO__ } = useI18n();

	const [ usernameOrEmailVal, setUsernameOrEmailVal ] = useState( '' );
	const { submitUsernameOrEmail } = useDispatch( AUTH_STORE );

	const onSubmitUsernameOrEmail = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		submitUsernameOrEmail( usernameOrEmailVal );
	};

	return (
		<form onSubmit={ onSubmitUsernameOrEmail }>
			<TextControl
				label={ NO__( 'Email Address or Username' ) }
				value={ usernameOrEmailVal }
				// todo loading state
				onChange={ setUsernameOrEmailVal }
				required
			/>
			{ props.errorNotifications }
			<div>
				{ props.tos }

				<ModalSubmitButton>{ NO__( 'Login' ) }</ModalSubmitButton>
			</div>
		</form>
	);
};

export default EnterUsernameOrEmailForm;
