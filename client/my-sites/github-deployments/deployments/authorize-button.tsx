import { Button } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo, useState } from 'react';
import SocialLogo from 'calypso/components/social-logo';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import { useGithubAccountsQuery } from '../use-github-accounts-query';
import { openPopup } from '../utils/open-popup';

const POPUP_ID = 'github-oauth-authorize';

export const GitHubAuthorizeButton = () => {
	const { __ } = useI18n();
	const dispatch = useDispatch();

	const { error, isLoading, isRefetching, refetch } = useGithubAccountsQuery();

	const authorizationUrl = useMemo( () => {
		if ( ! error ) {
			return null;
		}

		return error.error_data.not_authorized.authorization_url;
	}, [ error ] );

	const [ isAuthorizing, setIsAuthorizing ] = useState( false );

	const startAuthorization = ( url: string ) => {
		setIsAuthorizing( true );

		openPopup( {
			url,
			popupId: POPUP_ID,
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
			disabled={ ! authorizationUrl || isLoading || isAuthorizing }
			onClick={ authorizationUrl ? () => startAuthorization( authorizationUrl ) : undefined }
		>
			<SocialLogo icon="github" size={ 18 } css={ { marginRight: '4px' } } />
			{ __( 'Authorize GitHub' ) }
		</Button>
	);
};
