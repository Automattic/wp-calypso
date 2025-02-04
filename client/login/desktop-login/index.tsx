import './style.scss';
import { Button } from '@wordpress/components';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import { Notice } from 'calypso/components/notice';
import WpcomLoginForm from 'calypso/signup/wpcom-login-form';

const debug = debugFactory( 'calypso:desktop' );

// The desktop app will intercept this URL and start the login in the user's external browser.
const loginUrl = '/desktop-start-login';

type Props =
	| { action: 'start'; accessToken?: never; error?: never }
	| { action: 'finalize'; accessToken: string; error?: string };

/**
 * The login page of the WordPress.com Desktop app.
 *
 * Initially (action=start), a button is rendered that when clicked sends the user
 * to their browser (outside the desktop app), so that they can log in to WordPress.com.
 *
 * When authentication is complete, the user is redirected back to the desktop app
 * and ends up here (action=finalize), with their access token passed as a prop.
 *
 * We then use that access token to submit the login form, which will set the cookie,
 * and thus log the user in.
 */
export default function DesktopLogin( props: Props ) {
	const { action, accessToken } = props;
	const isStart = action === 'start';
	const isFinalize = action === 'finalize';

	const translate = useTranslate();
	const [ username, setUsername ] = useState< string >();
	const [ error, setError ] = useState< string | undefined >(
		props.error ?? ( action === 'finalize' && ! accessToken )
			? 'Access token is missing'
			: undefined
	);

	if ( error ) {
		debug( error );
	}

	// Retrieve the username from the API.
	useEffect( () => {
		if ( accessToken && ! username ) {
			debug( 'Retrieving username from the API' );
			getUsername( accessToken )
				.then( setUsername )
				.catch( () => setError( 'Failed to retrieve username' ) );
		}
	}, [ accessToken, username ] );

	return (
		<Main className="desktop-login">
			<div className="desktop-login__content">
				{ error ? (
					<Notice
						status="is-error"
						onDismissClick={ () => setError( undefined ) }
						translate={ translate }
					>
						{ translate( 'We were not able to log you in. Please try again.' ) }
					</Notice>
				) : undefined }
				{ isStart || error ? (
					// Initial login page, or authentication failed.
					<>
						<FormattedHeader
							headerText={ translate( 'Log in' ) }
							subHeaderText={ translate( 'Authorize with WordPress.com to get started' ) }
							brandFont
						/>
						<Button
							variant="primary"
							href={ loginUrl }
							onClick={ () => {
								setError( undefined );
								setUsername( undefined );
							} }
						>
							{ translate( 'Log in with WordPress.com' ) }
						</Button>
					</>
				) : undefined }
				{ isFinalize && ! error && username ? (
					// We're back after the user successfully authenticated in their browser,
					// and we have already retrieved the username from the API.
					<WpcomLoginForm
						log={ username }
						authorization={ 'Bearer ' + accessToken }
						redirectTo={ window.location.href }
					/>
				) : undefined }
			</div>
		</Main>
	);
}

async function getUsername( accessToken: string ): Promise< string > {
	const response = await fetch( 'https://public-api.wordpress.com/rest/v1/me', {
		headers: {
			Authorization: `Bearer ${ accessToken }`,
		},
	} );
	if ( ! response.ok ) {
		throw new Error( `Failed to retrieve username: ${ response.status }` );
	}
	return ( await response.json() ).username;
}
