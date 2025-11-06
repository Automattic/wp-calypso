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
import PayPalIcon from 'calypso/components/social-icons/paypal';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import { isFormDisabled as isFormDisabledSelector } from 'calypso/state/login/selectors';
import { getErrorFromHTTPError, postLoginRequest } from 'calypso/state/login/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import { getRedirectUri } from './utils';
import type { AppState } from 'calypso/types';

import '@automattic/components/styles/wp-button-override.scss';
import './style.scss';

type PayPalLoginButtonProps = {
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

// @todo this component is a copy of GitHubLoginButton and may need to be refactored.
export const PayPalLoginButton = ( {
	children,
	responseHandler,
	onClick,
	socialServiceResponse,
	userHasDisconnected,
	isLogin,
	overrideRedirectUri,
}: PayPalLoginButtonProps ) => {
	const translate = useTranslate();
	const redirectUri = useSelector(
		( state: AppState ) => overrideRedirectUri || getRedirectUri( 'paypal', state, isLogin )
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

	const handlePayPalError = useCallback( () => {
		dispatch(
			errorNotice(
				translate( 'Something went wrong when trying to connect with PayPal. Please try again.' )
			)
		);
	}, [ dispatch, translate ] );

	const exchangeCodeForToken = useCallback(
		async ( auth_code: string ) => {
			let response;
			try {
				response = await postLoginRequest( 'exchange-social-auth-code', {
					service: 'paypal',
					auth_code,
					client_id: config( 'wpcom_signup_id' ),
					client_secret: config( 'wpcom_signup_key' ),
				} );
			} catch ( httpError ) {
				const { code: error_code } = getErrorFromHTTPError( httpError as object );

				if ( error_code ) {
					dispatch(
						recordTracksEvent( 'calypso_social_button_auth_code_exchange_failure', {
							social_account_type: 'paypal',
							// TODO
							//starting_point: this.props.startingPoint,
							error_code,
						} )
					);
				}

				handlePayPalError();
				return;
			}

			dispatch(
				recordTracksEvent( 'calypso_social_button_auth_code_exchange_success', {
					social_account_type: 'paypal',
					// TODO
					//starting_point: this.props.startingPoint,
				} )
			);
			const { access_token } = response?.body?.data as ExchangeCodeForTokenResponse;
			responseHandler( { access_token, service: 'paypal' } );
		},
		[ dispatch, handlePayPalError, responseHandler ]
	);

	const stripQueryString = ( url: string ) => {
		const urlParts = url.split( '?' );
		return urlParts[ 0 ];
	};

	useEffect( () => {
		if ( service === 'paypal' && socialServiceResponse?.access_token ) {
			responseHandler( {
				access_token: socialServiceResponse.access_token,
				service: 'paypal',
			} );
		}
	}, [ socialServiceResponse, service, responseHandler ] );

	useEffect( () => {
		if ( code && service === 'paypal' && ! userHasDisconnected ) {
			exchangeCodeForToken( code );
		}
	}, [ code, service, userHasDisconnected, exchangeCodeForToken ] );

	useEffect( () => {
		if ( service === 'paypal' && authError ) {
			handlePayPalError();
		}
	}, [ authError, service, handlePayPalError ] );

	const handleClick = ( e: MouseEvent< HTMLButtonElement > ) => {
		errorRef.current = e.currentTarget;
		e.preventDefault();

		if ( onClick ) {
			onClick( e );
		}

		window.location.href = `https://public-api.wordpress.com/wpcom/v2/hosting/paypal/app-authorize?redirect_uri=${ stripQueryString(
			redirectUri
		) }&ux_mode=redirect`;
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
					className="a8c-components-wp-button social-buttons__button paypal"
					disabled={ isDisabled }
					data-social-service="paypal"
					{ ...eventHandlers }
					variant="secondary"
					__next40pxDefaultSize
				>
					<PayPalIcon isDisabled={ isDisabled } />

					<span className="social-buttons__service-name">
						{ translate( 'Continue with %(service)s', {
							args: { service: 'PayPal' },
							comment:
								'%(service)s is the name of a third-party authentication provider, e.g. "Google", "Facebook", "Apple" ...',
						} ) }
					</span>
				</Button>
			) }
		</>
	);
};

export default PayPalLoginButton;
