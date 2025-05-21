import { Button } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import FormButton from 'calypso/components/forms/form-button';
import FormTextInput from 'calypso/components/forms/form-text-input';
import LoggedOutForm from 'calypso/components/logged-out-form';
import Notice from 'calypso/components/notice';
import { preventWidows } from 'calypso/lib/formatting';
import { navigate } from 'calypso/lib/navigate';
import { fetchMagicLoginAuthenticate } from 'calypso/state/login/magic-login/actions';
import { getRedirectToOriginal } from 'calypso/state/login/selectors';
import getMagicLoginAuthSuccessData from 'calypso/state/selectors/get-magic-login-auth-success-data';
import getMagicLoginRequestAuthError from 'calypso/state/selectors/get-magic-login-request-auth-error';
import getMagicLoginRequestedAuthSuccessfully from 'calypso/state/selectors/get-magic-login-requested-auth-successfully';
import isFetchingMagicLoginAuth from 'calypso/state/selectors/is-fetching-magic-login-auth';

const VerifyLoginCode = ( {
	isValidating,
	isAuthenticated,
	authError,
	publicToken,
	usernameOrEmail,
	authSuccessData,
	fetchMagicLoginAuthenticate: authenticate,
	redirectTo,
	translate,
	onResendEmail,
} ) => {
	const [ verificationCode, setVerificationCode ] = useState( '' );
	const [ isRedirecting, setIsRedirecting ] = useState( false );

	useEffect( () => {
		if ( isAuthenticated && authSuccessData ) {
			setIsRedirecting( true );
			navigate( authSuccessData.redirect_to );
		}
	}, [ isAuthenticated, authSuccessData ] );

	const onCodeChange = ( event ) => {
		setVerificationCode( event.target.value );
	};

	const onSubmit = ( event ) => {
		event.preventDefault();

		if ( ! verificationCode || ! publicToken ) {
			return;
		}

		// Format: publicToken:code
		const loginToken = `${ publicToken }:${ btoa( verificationCode ) }`;

		authenticate( loginToken, redirectTo );
	};

	const isDisabled = isValidating || isRedirecting;
	const submitEnabled = verificationCode.length > 0 && ! isDisabled;

	return (
		<div className="magic-login__successfully-jetpack">
			<h1 className="magic-login__form-header">{ translate( 'Check your inbox' ) }</h1>
			<p>
				{ translate(
					'We sent a message to ({{strong}}%(email)s{{/strong}}) with a code to log in to WordPress.com.',
					{
						args: {
							email: usernameOrEmail,
						},
						components: {
							strong: <strong />,
						},
					}
				) }
			</p>
			<LoggedOutForm onSubmit={ onSubmit }>
				{ authError && (
					<Notice
						showDismiss={ false }
						status="is-error"
						text={ translate( 'Invalid code. Please try again.' ) }
					/>
				) }

				<FormTextInput
					autoCapitalize="off"
					className="magic-login__verify-code-field"
					disabled={ isDisabled }
					name="verificationCode"
					value={ verificationCode }
					onChange={ onCodeChange }
					placeholder={ translate( 'Enter your verification code' ) }
				/>

				<div className="magic-login__form-action">
					<FormButton primary disabled={ ! submitEnabled } busy={ isDisabled } type="submit">
						{ translate( 'Verify' ) }
					</FormButton>
				</div>
			</LoggedOutForm>

			<p>{ preventWidows( translate( "Only one step left—we'll connect your site next." ) ) }</p>
			<div className="magic-login__successfully-jetpack-actions">
				<p>
					{ translate(
						"Didn't get the code? Check your spam folder or {{button}}resend the email{{/button}}",
						{
							components: {
								button: (
									<Button
										className="magic-login__resend-button"
										variant="link"
										onClick={ onResendEmail }
										disabled={ isRedirecting }
									/>
								),
							},
						}
					) }
				</p>
				<p>
					{ translate( 'Wrong email or account? {{link}}Use a different account{{/link}}', {
						components: {
							link: <a className="magic-login__log-in-link" href="/log-in" />,
						},
					} ) }
				</p>
			</div>
		</div>
	);
};

VerifyLoginCode.propTypes = {
	isValidating: PropTypes.bool,
	isAuthenticated: PropTypes.bool,
	authError: PropTypes.object,
	publicToken: PropTypes.string,
	usernameOrEmail: PropTypes.string,
	authSuccessData: PropTypes.object,
	fetchMagicLoginAuthenticate: PropTypes.func.isRequired,
	redirectTo: PropTypes.string,
	onResendEmail: PropTypes.func,
};

const mapState = ( state ) => ( {
	isValidating: isFetchingMagicLoginAuth( state ),
	isAuthenticated: getMagicLoginRequestedAuthSuccessfully( state ),
	authError: getMagicLoginRequestAuthError( state ),
	redirectTo: getRedirectToOriginal( state ),
	authSuccessData: getMagicLoginAuthSuccessData( state ),
} );

const mapDispatch = {
	fetchMagicLoginAuthenticate,
};

export default connect( mapState, mapDispatch )( localize( VerifyLoginCode ) );
