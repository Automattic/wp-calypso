import config from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import SocialLogo from 'calypso/components/social-logo';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import { useGithubAccountsQuery } from '../use-github-accounts-query';

const AUTHORIZE_URL = addQueryArgs( 'https://github.com/login/oauth/authorize', {
	client_id: config( 'github_oauth_client_id' ),
} );

const POPUP_ID = 'github-oauth-authorize';

const authorizeGitHub = () => {
	return new Promise< void >( ( resolve, reject ) => {
		let popup: Window | null;

		try {
			popup = window.open( AUTHORIZE_URL, POPUP_ID, 'height=600,width=700' );
		} catch {
			return reject();
		}

		if ( ! popup ) {
			reject();
		}

		const interval = setInterval( (): void => {
			if ( popup?.closed ) {
				resolve();
				clearInterval( interval );
			}
		}, 500 );
	} );
};

export const GitHubAuthorizeButton = () => {
	const { __ } = useI18n();
	const dispatch = useDispatch();

	const { isLoading, isRefetching, refetch } = useGithubAccountsQuery();

	const [ isAuthorizing, setIsAuthorizing ] = useState( false );

	const startAuthorization = () => {
		setIsAuthorizing( true );

		authorizeGitHub()
			.then( () => refetch() )
			.catch( () => dispatch( errorNotice( 'Failed to authorize GitHub. Please try again.' ) ) )
			.finally( () => setIsAuthorizing( false ) );
	};

	if ( isLoading && ! isRefetching ) {
		return null;
	}

	return (
		<Button
			primary
			css={ { display: 'flex', alignItems: 'center' } }
			busy={ isLoading || isAuthorizing }
			disabled={ isLoading || isAuthorizing }
			onClick={ startAuthorization }
		>
			<SocialLogo icon="github" size={ 18 } css={ { marginRight: '4px' } } />
			{ __( 'Authorize GitHub' ) }
		</Button>
	);
};
