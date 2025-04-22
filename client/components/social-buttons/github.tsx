import config from '@automattic/calypso-config';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import {
	cloneElement,
	MouseEvent,
	ReactElement,
	ReactNode,
	useCallback,
	useEffect,
	useRef,
} from 'react';
import GitHubIcon from 'calypso/components/social-icons/github';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { isFormDisabled as isFormDisabledSelector } from 'calypso/state/login/selectors';
import { getErrorFromHTTPError, postLoginRequest } from 'calypso/state/login/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import { getRedirectUri } from './utils';
import type { AppState } from 'calypso/types';

import '@automattic/components/styles/wp-button-override.scss';
import './style.scss';

type GithubLoginButtonProps = {
	children?: ReactNode;
	responseHandler: ( response: ExchangeCodeForTokenResponse ) => void;
	onClick?: ( event: MouseEvent< HTMLButtonElement > ) => void;
	socialServiceResponse?: ExchangeCodeForTokenResponse | null;
	userHasDisconnected?: boolean;
	isLogin: boolean;
	overrideRedirectUri?: string;
};

type ExchangeCodeForTokenResponse = {
	service: string;
	access_token: string;
};

const GitHubLoginButton = ( {
	children,
	responseHandler,
	onClick,
	socialServiceResponse,
	userHasDisconnected,
	isLogin,
	overrideRedirectUri,
}: GithubLoginButtonProps ) => {
	const translate = useTranslate();
	const redirectUri = useSelector(
		( state: AppState ) => overrideRedirectUri || getRedirectUri( 'github', state, isLogin )
	);
	const { code, service } = useSelector( ( state: AppState ) => state.route?.query?.initial ) ?? {};

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

	const isDisabled = useSelector( isFormDisabledSelector );
	const dispatch = useDispatch();
	const errorRef = useRef< EventTarget | null >( null );

	const handleGitHubError = useCallback( () => {
		dispatch(
			errorNotice(
				translate( 'Something went wrong when trying to connect with GitHub. Please try again.' )
			)
		);
	}, [ dispatch, translate ] );

	const exchangeCodeForToken = useCallback(
		async ( auth_code: string ) => {
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
			responseHandler( { access_token, service: 'github' } );
		},
		[ dispatch, handleGitHubError, responseHandler ]
	);

	const stripQueryString = ( url: string ) => {
		const urlParts = url.split( '?' );
		return urlParts[ 0 ];
	};

	useEffect( () => {
		if ( service === 'github' && socialServiceResponse?.access_token ) {
			responseHandler( {
				access_token: socialServiceResponse.access_token,
				service: 'github',
			} );
		}
	}, [ socialServiceResponse, service, responseHandler ] );

	useEffect( () => {
		if ( code && service === 'github' && ! userHasDisconnected ) {
			exchangeCodeForToken( code );
		}
	}, [ code, service, userHasDisconnected, exchangeCodeForToken ] );

	useEffect( () => {
		if ( service === 'github' && authError ) {
			handleGitHubError();
		}
	}, [ authError, service, handleGitHubError ] );

	const handleClick = ( e: MouseEvent< HTMLButtonElement > ) => {
		errorRef.current = e.currentTarget;
		e.preventDefault();

		if ( onClick ) {
			onClick( e );
		}

		const scope = encodeURIComponent( 'read:user,user:email' );
		window.location.href = `https://public-api.wordpress.com/wpcom/v2/hosting/github/app-authorize?redirect_uri=${ stripQueryString(
			redirectUri
		) }&scope=${ scope }&ux_mode=redirect`;
	};

	const eventHandlers = {
		onClick: handleClick,
	};

	let customButton = null;
	if ( children ) {
		const childProps = {
			className: clsx( { disabled: isDisabled } ),
			...eventHandlers,
		};

		customButton = cloneElement( children as ReactElement, childProps );
	}

	return (
		<>
			{ customButton ? (
				customButton
			) : (
				<Button
					className={ clsx( 'a8c-components-wp-button social-buttons__button github', {
						disabled: isDisabled,
					} ) }
					data-social-service="github"
					{ ...eventHandlers }
					variant="secondary"
					__next40pxDefaultSize
				>
					<GitHubIcon isDisabled={ isDisabled } />

					<span className="social-buttons__service-name">
						{ translate( 'Continue with %(service)s', {
							args: { service: 'GitHub' },
							comment:
								'%(service)s is the name of a third-party authentication provider, e.g. "Google", "Facebook", "Apple" ...',
						} ) }
					</span>
				</Button>
			) }
		</>
	);
};

export default GitHubLoginButton;
