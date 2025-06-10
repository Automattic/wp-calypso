import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useState, useEffect, useRef, createRef } from 'react';
import { connect } from 'react-redux';
import FormButton from 'calypso/components/forms/form-button';
import FormTextInput from 'calypso/components/forms/form-text-input';
import LoggedOutForm from 'calypso/components/logged-out-form';
import { navigate } from 'calypso/lib/navigate';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { fetchMagicLoginAuthenticate } from 'calypso/state/login/magic-login/actions';
import { getRedirectToOriginal } from 'calypso/state/login/selectors';
import getMagicLoginAuthSuccessData from 'calypso/state/selectors/get-magic-login-auth-success-data';
import getMagicLoginRequestAuthError from 'calypso/state/selectors/get-magic-login-request-auth-error';
import getMagicLoginRequestedAuthSuccessfully from 'calypso/state/selectors/get-magic-login-requested-auth-successfully';
import isFetchingMagicLoginAuth from 'calypso/state/selectors/is-fetching-magic-login-auth';

const CODE_LENGTH = 6;

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
	// Create an array of 6 empty strings for our verification code
	const [ codeCharacters, setCodeCharacters ] = useState( Array( CODE_LENGTH ).fill( '' ) );
	const [ isRedirecting, setIsRedirecting ] = useState( false );
	const [ showError, setShowError ] = useState( false );

	// Create refs for each input field to manage focus
	const inputRefs = useRef( Array.from( { length: CODE_LENGTH }, () => createRef() ) );

	useEffect( () => {
		if ( isAuthenticated && authSuccessData ) {
			setIsRedirecting( true );
			navigate( authSuccessData.redirect_to );
		}
	}, [ isAuthenticated, authSuccessData ] );

	// Focus first input on page load for an easy input
	useEffect( () => {
		inputRefs?.current[ 0 ]?.current?.focus();
	}, [] );

	// Update local error state when authError changes
	useEffect( () => {
		setShowError( !! authError );
	}, [ authError ] );

	// Focus the last input when an auth error is detected
	useEffect( () => {
		if ( authError && inputRefs?.current[ CODE_LENGTH - 1 ]?.current ) {
			// Focus the last input when error occurs
			inputRefs.current[ CODE_LENGTH - 1 ]?.current.focus();
		}
	}, [ authError ] );

	// Get the combined verification code from all inputs
	const getVerificationCode = () => codeCharacters.join( '' );

	// Handle changes to any individual input
	const onCodeCharacterChange = ( index, value ) => {
		// Clear error display when user starts editing
		setShowError( false );

		// Only allow a single character per input and no spaces
		if ( value.length > 1 ) {
			value = value.charAt( 0 );
		}

		// Skip spaces
		if ( value === ' ' ) {
			return;
		}

		// Update the code array
		const newCodeCharacters = [ ...codeCharacters ];
		newCodeCharacters[ index ] = value;
		setCodeCharacters( newCodeCharacters );

		// Auto-focus next input if the current one has a value
		if ( value && index < CODE_LENGTH - 1 ) {
			inputRefs.current[ index + 1 ].current.focus();
		}
	};

	// Handle keyboard navigation between inputs
	const onKeyDown = ( index, event ) => {
		const { key } = event;

		// Handle Backspace - move to previous input when current is empty
		if ( key === 'Backspace' && ! codeCharacters[ index ] && index > 0 ) {
			inputRefs.current[ index - 1 ].current.focus();
		}
	};

	// Handle paste event to fill multiple inputs
	const onPaste = ( index, event ) => {
		event.preventDefault();

		// Clear error display when user pastes new code
		setShowError( false );

		const pastedText = event.clipboardData.getData( 'text' ).trim();
		if ( ! pastedText ) {
			return;
		}

		// Remove spaces from pasted text
		const filteredText = pastedText.replace( /\s/g, '' );
		if ( ! filteredText ) {
			return;
		}

		// Fill as many inputs as possible with the pasted text
		const newCodeCharacters = [ ...codeCharacters ];

		for ( let i = 0; i < Math.min( CODE_LENGTH - index, filteredText.length ); i++ ) {
			newCodeCharacters[ index + i ] = filteredText.charAt( i );
		}

		setCodeCharacters( newCodeCharacters );

		// Focus the next unfilled input or the last input if all are filled
		const nextIndex = Math.min( index + filteredText.length, CODE_LENGTH - 1 );
		inputRefs.current[ nextIndex ].current.focus();
	};

	const onSubmit = ( event ) => {
		event.preventDefault();

		const verificationCode = getVerificationCode();
		if ( ! verificationCode || verificationCode.length !== CODE_LENGTH || ! publicToken ) {
			return;
		}

		// Track magic code verification attempt
		recordTracksEvent( 'calypso_login_magic_code_submit', {
			code_length: verificationCode.length,
		} );

		// Format: publicToken:code
		const loginToken = `${ publicToken }:${ btoa( verificationCode ) }`;

		authenticate( loginToken, redirectTo, null, true );
	};

	const isDisabled = isValidating || isRedirecting;
	const submitEnabled = getVerificationCode().length === CODE_LENGTH && ! isDisabled;

	return (
		<div className="magic-login__successfully-jetpack">
			<h1 className="magic-login__form-header">{ translate( 'Check your email for a code' ) }</h1>
			<p>
				{ translate( 'Enter the code sent to your email {{strong}}%(email)s{{/strong}}', {
					args: {
						email: usernameOrEmail,
					},
					components: {
						strong: <strong />,
					},
				} ) }
			</p>
			<LoggedOutForm
				className={ clsx( 'magic-login__verify-code-form', {
					'magic-login__verify-code-form--error': showError,
				} ) }
				onSubmit={ onSubmit }
			>
				<div className="magic-login__verify-code-field-container">
					{ Array.from( { length: CODE_LENGTH } ).map( ( _, index ) => (
						<FormTextInput
							key={ index }
							ref={ inputRefs.current[ index ] }
							autoCapitalize="off"
							className="magic-login__verify-code-character-field"
							disabled={ isDisabled }
							maxLength={ 1 }
							value={ codeCharacters[ index ] }
							onChange={ ( event ) => onCodeCharacterChange( index, event.target.value ) }
							onKeyDown={ ( event ) => onKeyDown( index, event ) }
							onPaste={ ( event ) => onPaste( index, event ) }
							aria-label={ translate( 'Verification code character %(position)s of %(total)s', {
								args: {
									position: index + 1,
									total: CODE_LENGTH,
								},
							} ) }
						/>
					) ) }
				</div>

				{ showError && (
					<div className="magic-login__verify-code-error-message">
						{ translate( "Oops, that's the wrong code. Please verify it." ) }
					</div>
				) }

				<div className="magic-login__form-action">
					<FormButton
						primary
						disabled={ ! submitEnabled && ! isDisabled }
						busy={ isDisabled }
						type="submit"
					>
						{ isDisabled ? translate( 'Verifying code…' ) : translate( 'Verify code' ) }
					</FormButton>
				</div>
			</LoggedOutForm>

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
							link: <a className="magic-login__log-in-link" href="/log-in/jetpack" />,
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
	recordTracksEvent,
};

export default connect( mapState, mapDispatch )( localize( VerifyLoginCode ) );
