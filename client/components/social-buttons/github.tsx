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
import { useSelector } from 'calypso/state';
import { isFormDisabled as isFormDisabledSelector } from 'calypso/state/login/selectors';
import { getErrorFromHTTPError, postLoginRequest } from 'calypso/state/login/utils';
import type { AppState } from 'calypso/types';

import './style.scss';

type GithubLoginButtonProps = {
	children?: ReactNode;
	responseHandler: ( response: any ) => void;
	redirectUri: string;
	onClick?: () => void;
	socialServiceResponse?: string | null;
};

const GitHubLoginButton = ( {
	children,
	responseHandler,
	redirectUri,
	onClick,
	socialServiceResponse,
}: GithubLoginButtonProps ) => {
	const translate = useTranslate();

	const { code, service } = useSelector( ( state: AppState ) => state.route?.query?.initial );
	const isFormDisabled = useSelector( isFormDisabledSelector );

	const [ disabledState ] = useState< boolean >( false );
	const [ errorState ] = useState< string | null >( null );
	const [ showError, setShowError ] = useState< boolean >( false );

	const errorRef = useRef< EventTarget | null >( null );

	const exchangeCodeForToken = async ( auth_code: string ) => {
		let response;
		try {
			// eslint-disable-next-line
			response = await postLoginRequest( 'exchange-social-auth-code', {
				service: 'github',
				auth_code,
				client_id: config( 'wpcom_signup_id' ),
				client_secret: config( 'wpcom_signup_key' ),
			} );
		} catch ( httpError ) {
			const { code: error_code } = getErrorFromHTTPError( httpError );

			if ( error_code ) {
				// TODO
				/*
				this.props.recordTracksEvent( 'calypso_social_button_auth_code_exchange_failure', {
					social_account_type: 'google',
					starting_point: this.props.startingPoint,
					error_code,
				} );
				*/
			}
			// TODO
			/*
			this.props.showErrorNotice(
				this.props.translate(
					'Something went wrong when trying to connect with Google. Please try again.'
				)
			);
			*/

			return;
		}
		/*
		this.props.recordTracksEvent( 'calypso_social_button_auth_code_exchange_success', {
			social_account_type: 'google',
			starting_point: this.props.startingPoint,
		} );

		const { access_token, id_token } = response.body.data;

		this.props.responseHandler( { access_token, id_token } );
		*/
	};

	useEffect( () => {
		// This feature is already gated inside client/blocks/authentication/social/index.tsx
		// Adding an extra check here to prevent accidental inclusions in other parts of the app
		if ( ! config.isEnabled( 'login/github' ) ) {
			return;
		}
	} );

	useEffect( () => {
		if ( socialServiceResponse ) {
			responseHandler( socialServiceResponse );
		}
	}, [ socialServiceResponse ] );

	useEffect( () => {
		if ( code && service === 'github' ) {
			exchangeCodeForToken( code ).then( () => {
				// console.log(code);
				//				responseHandler( code );
			} );
		}
	}, [ code, service ] );

	const isDisabled = isFormDisabled || disabledState;

	const handleClick = ( e: MouseEvent< HTMLButtonElement > ) => {
		errorRef.current = e.currentTarget;
		e.preventDefault();

		if ( onClick ) {
			onClick();
		}

		const clientId = config( 'github_oauth_client_id' );
		const redirectEndpoint = encodeURIComponent(
			`https://public-api.wordpress.com/wpcom/v2/hosting/github/app-callback?final_redirect_uri=${ redirectUri }`
		);
		window.location.href = `https://github.com/login/oauth/authorize?client_id=${ clientId }&redirect_uri=${ redirectEndpoint }`;
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
