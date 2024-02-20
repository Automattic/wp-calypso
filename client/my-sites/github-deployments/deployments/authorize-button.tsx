import config from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import SocialLogo from 'calypso/components/social-logo';
import { useDispatch } from 'calypso/state';
import { postLoginRequest } from 'calypso/state/login/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import { useGithubAccountsQuery } from '../use-github-accounts-query';
import { openPopup } from '../utils/open-popup';
import { useSaveGitHubCredentialsMutation } from './use-save-github-credentials-mutation';

const AUTHORIZE_URL = addQueryArgs( 'https://github.com/login/oauth/authorize', {
	client_id: config( 'github_oauth_client_id' ),
} );

const POPUP_ID = 'github-app-authorize';

export const GitHubAuthorizeButton = () => {
	const { __ } = useI18n();
	const dispatch = useDispatch();

	const { isLoading, isRefetching, refetch } = useGithubAccountsQuery();
	const { saveGitHubCredentials } = useSaveGitHubCredentialsMutation();

	const [ isAuthorizing, setIsAuthorizing ] = useState( false );

	const startAuthorization = () => {
		setIsAuthorizing( true );

		openPopup< { code: string } >( {
			url: AUTHORIZE_URL,
			popupId: POPUP_ID,
			expectedEvent: 'github-app-authorized',
		} )
			.then( ( { code } ) => {
				return postLoginRequest( 'exchange-social-auth-code', {
					service: 'github',
					auth_code: code,
					client_id: config( 'wpcom_signup_id' ),
					client_secret: config( 'wpcom_signup_key' ),
				} );
			} )
			.then( async ( response ) => {
				if ( ! response.body?.data?.access_token ) {
					throw new Error( 'Access token not included in the response.' );
				}

				return saveGitHubCredentials( { accessToken: response.body.data.access_token } );
			} )
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
