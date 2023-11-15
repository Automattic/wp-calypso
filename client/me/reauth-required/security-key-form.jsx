import { Card, FormInputValidation, Spinner } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import FormButton from 'calypso/components/forms/form-button';
import { useLoginWithSecurityKeyMutation } from 'calypso/lib/two-step-authorization/data/use-login-with-security-key-mutation';
import { useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';

import './security-key-form.scss';

const SecurityKeyForm = () => {
	const translate = useTranslate();
	const {
		loginWithSecurityKey,
		isError,
		isLoading: isAuthenticating,
	} = useLoginWithSecurityKeyMutation();

	const currentUserId = useSelector( getCurrentUserId );

	const handleSubmit = ( event ) => {
		event.preventDefault();
		loginWithSecurityKey( currentUserId );
	};

	return (
		<form onSubmit={ handleSubmit }>
			<Card compact className="security-key-form__verification-code-form">
				{ ! isAuthenticating ? (
					<div>
						<p>
							{ translate( '{{strong}}Use your security key to finish logging in.{{/strong}}', {
								components: {
									strong: <strong />,
								},
							} ) }
						</p>
						<p>
							{ translate(
								'Insert your security key into your USB port. Then tap the button or gold disc.'
							) }
						</p>
					</div>
				) : (
					<div className="security-key-form__add-wait-for-key">
						<Spinner />
						<p className="security-key-form__add-wait-for-key-heading">
							{ translate( 'Waiting for security key' ) }
						</p>
						<p>{ translate( 'Connect and touch your security key to log in.' ) }</p>
					</div>
				) }
				{ isError && (
					<FormInputValidation
						isError
						text={ this.props.translate(
							'An error occurred, please try again or use an alternate authentication method.'
						) }
					/>
				) }
				<FormButton
					autoFocus // eslint-disable-line jsx-a11y/no-autofocus
					primary
					disabled={ isAuthenticating }
				>
					{ translate( 'Continue with security key' ) }
				</FormButton>
			</Card>
		</form>
	);
};

export default SecurityKeyForm;
