import config from '@automattic/calypso-config';
import { Popover } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import {
	cloneElement,
	MouseEvent,
	ReactElement,
	ReactNode,
	useEffect,
	useRef,
	useState,
} from 'react';
import GitHubIcon from 'calypso/components/social-icons/github';
import { preventWidows } from 'calypso/lib/formatting';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { isFormDisabled as isFormDisabledSelector } from 'calypso/state/login/selectors';
import { getErrorFromHTTPError, postLoginRequest } from 'calypso/state/login/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import type { AppState } from 'calypso/types';

import './style.scss';

type GithubLoginButtonProps = {
	children?: ReactNode;
	responseHandler: ( response: any, triggeredByUser?: boolean ) => void;
	redirectUri: string;
	onClick?: () => void;
	socialServiceResponse?: string | null;
	userHasDisconnected?: boolean;
};

type ExchangeCodeForTokenResponse = {
	access_token: string;
};

const GitHubLoginButton = ( {
	children,
	responseHandler,
	redirectUri,
	onClick,
	socialServiceResponse,
	userHasDisconnected,
}: GithubLoginButtonProps ) => {
	const translate = useTranslate();

	const { code, service } = useSelector( ( state: AppState ) => state.route?.query?.initial );
	const authError = useSelector( ( state: AppState ) => {
		const path = state?.route?.path?.current;
		const { initial, current } = state?.route?.query ?? {};
		const initialError = initial?.error;
		const currentError = current?.error;

		// Sign-up flow is losing the error query param when redirecting to `/start/user-social`
		// because of that, we are returning the initial query param error.
		if ( path?.includes( '/start/user-social' ) ) {
			return initialError;
		}
		return currentError;
	} );

	const isFormDisabled = useSelector( isFormDisabledSelector );
	const dispatch = useDispatch();

	const [ disabledState ] = useState< boolean >( false );
	const [ errorState ] = useState< string | null >( null );
	const [ showError, setShowError ] = useState< boolean >( false );

	const errorRef = useRef< EventTarget | null >( null );

	const handleGitHubError = () => {
		dispatch(
			errorNotice(
				translate( 'Something went wrong when trying to connect with GitHub. Please try again.' )
			)
		);
	};

	const exchangeCodeForToken = async ( auth_code: string ) => {
		let response;
		try {
			response = await postLoginRequest( 'exchange-social-auth-code', {
				service: 'github',
				auth_code,
				client_id: config( 'wpcom_signup_id' ),
				client_secret: config( 'wpcom_signup_key' ),
			} );
		} catch ( httpError ) {
			const { code: error_code } = getErrorFromHTTPError( httpError as object );

			if ( error_code ) {
				dispatch(
					recordTracksEvent( 'calypso_social_button_auth_code_exchange_failure', {
						social_account_type: 'github',
						// TODO
						//starting_point: this.props.startingPoint,
						error_code,
					} )
				);
			}

			handleGitHubError();
			return;
		}

		dispatch(
			recordTracksEvent( 'calypso_social_button_auth_code_exchange_success', {
				social_account_type: 'github',
				// TODO
				//starting_point: this.props.startingPoint,
			} )
		);
		const { access_token } = response?.body?.data as ExchangeCodeForTokenResponse;
		responseHandler( { access_token } );
	};

	const stripQueryString = ( url: string ) => {
		const urlParts = url.split( '?' );
		return urlParts[ 0 ];
	};

	useEffect( () => {
		if ( socialServiceResponse ) {
			responseHandler( socialServiceResponse );
		}
	}, [ socialServiceResponse ] );

	useEffect( () => {
		if ( code && service === 'github' && ! userHasDisconnected ) {
			exchangeCodeForToken( code );
		}
	}, [ code, service, userHasDisconnected ] );

	useEffect( () => {
		if ( authError ) {
			handleGitHubError();
		}
	}, [ authError, handleGitHubError ] );

	const isDisabled = isFormDisabled || disabledState;

	const handleClick = ( e: MouseEvent< HTMLButtonElement > ) => {
		errorRef.current = e.currentTarget;
		e.preventDefault();

		if ( onClick ) {
			onClick();
		}

		const scope = encodeURIComponent( 'read:user,user:email' );
		window.location.href = `https://public-api.wordpress.com/wpcom/v2/hosting/github/app-redirect?redirect_uri=${ stripQueryString(
			redirectUri
		) }&scope=${ scope }&ux_mode=redirect`;
	};

	const eventHandlers = {
		onClick: handleClick,
		onMouseEnter: () => setShowError( true ),
		onMouseLeave: () => setShowError( false ),
	};

	let customButton = null;
	if ( children ) {
		const childProps = {
			className: classNames( { disabled: isDisabled } ),
			...eventHandlers,
		};

		customButton = cloneElement( children as ReactElement, childProps );
	}

	// This feature is already gated inside client/blocks/authentication/social/index.tsx
	// Adding an extra check here to prevent accidental inclusions in other parts of the app
	if ( ! config.isEnabled( 'login/github' ) ) {
		return;
	}

	return (
		<>
			{ customButton ? (
				customButton
			) : (
				<button
					className={ classNames( 'social-buttons__button button', { disabled: isDisabled } ) }
					{ ...eventHandlers }
				>
					<GitHubIcon isDisabled={ isDisabled } />

					<span className="social-buttons__service-name">
						{ translate( 'Continue with %(service)s', {
							args: { service: 'GitHub' },
							comment:
								'%(service)s is the name of a third-party authentication provider, e.g. "Google", "Facebook", "Apple" ...',
						} ) }
					</span>
				</button>
			) }
			<Popover
				id="social-buttons__error"
				className="social-buttons__error"
				isVisible={ showError }
				onClose={ () => setShowError( false ) }
				position="top"
				context={ errorRef.current }
			>
				{ preventWidows( errorState ) }
			</Popover>
		</>
	);
};

export default GitHubLoginButton;
