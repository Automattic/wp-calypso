import debugFactory from 'debug';
import { useEffect, useState } from 'react';
import DesktopLoginStart from 'calypso/login/desktop-login/start';
import WpcomLoginForm from 'calypso/signup/wpcom-login-form';

const debug = debugFactory( 'calypso:desktop' );

interface Props {
	accessToken: string;
	error?: string;
}

/**
 * Final page of the login flow of the WordPress.com Desktop app.
 *
 * When the user has authenticated in their browser, they get redirected back to
 * the desktop app and end up here, with the access token passed as a prop.
 *
 * We then use that access token to submit the login form, which will set the cookie,
 * and thus log the user in.
 */
export default function DesktopLoginFinalize( props: Props ) {
	const { accessToken } = props;
	const [ username, setUsername ] = useState< string >();
	const [ error, setError ] = useState< string | undefined >(
		props.error ?? ! accessToken ? 'Access token is missing' : undefined
	);

	if ( error ) {
		debug( error );
	}

	useEffect( () => {
		if ( ! error && accessToken && ! username ) {
			debug( 'Retrieving username from the API' );
			getUsername( accessToken )
				.then( setUsername )
				.catch( () => setError( 'Failed to retrieve username' ) );
		}
	}, [ error, accessToken, username ] );

	if ( error ) {
		// Something went wrong, we render the desktop login start page,
		// which will display an error.
		return <DesktopLoginStart error={ error } />;
	}

	if ( ! username ) {
		// We haven't retrieved the username yet.
		return undefined;
	}

	return (
		<WpcomLoginForm
			log={ username }
			authorization={ 'Bearer ' + accessToken }
			redirectTo={ window.location.href }
			rememberMe
		/>
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
