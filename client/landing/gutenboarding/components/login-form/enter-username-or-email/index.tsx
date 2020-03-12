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
	const { __: NO__, _x: NO_x } = useI18n();

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
				placeholder={ NO_x(
					'E.g., yourname@email.com',
					"An example of a person's email, use something appropriate for the locale"
				) }
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
