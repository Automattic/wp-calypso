import { FormLabel } from '@automattic/components';
import { Icon } from '@wordpress/components';
import { seen, unseen } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { Controller, Control } from 'react-hook-form';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { CredentialsFormData } from '../types';
import { ErrorMessage } from './error-message';

interface Props {
	control: Control< CredentialsFormData >;
	errors: any;
}

export const PasswordField: React.FC< Props > = ( { control, errors } ) => {
	const translate = useTranslate();
	const [ passwordHidden, setPasswordHidden ] = useState( true );
	const toggleVisibilityClasses = clsx( {
		'site-migration-credentials__form-password__toggle': true,
	} );

	return (
		<div className="site-migration-credentials__form-field">
			<FormLabel htmlFor="site-migration-credentials__password">
				{ translate( 'Password' ) }
			</FormLabel>
			<Controller
				control={ control }
				name="password"
				rules={ {
					required: translate( 'Please enter your WordPress admin password.' ),
				} }
				render={ ( { field } ) => (
					<div className="site-migration-credentials__form-password">
						<FormTextInput
							autoComplete="off"
							id="site-migration-credentials__password"
							type={ passwordHidden ? 'password' : 'text' }
							isError={ !! errors.password }
							placeholder={ translate( 'Enter your Admin password' ) }
							{ ...field }
						/>
						<button
							className={ toggleVisibilityClasses }
							onClick={ () => setPasswordHidden( ! passwordHidden ) }
							type="button"
						>
							{ passwordHidden ? <Icon icon={ unseen } /> : <Icon icon={ seen } /> }
						</button>
					</div>
				) }
			/>
			<ErrorMessage error={ errors.password } />
		</div>
	);
};
