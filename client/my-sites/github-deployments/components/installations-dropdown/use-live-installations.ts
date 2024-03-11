import config from '@automattic/calypso-config';
import { useI18n } from '@wordpress/react-i18n';
import { addQueryArgs } from '@wordpress/url';
import { useLayoutEffect, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { postLoginRequest } from 'calypso/state/login/utils';
import { infoNotice, errorNotice } from 'calypso/state/notices/actions';
import {
	GitHubInstallationData,
	useGithubInstallationsQuery,
} from '../../use-github-installations-query';
import { openPopup } from './open-popup';
import { useSaveGitHubCredentialsMutation } from './use-save-github-credentials-mutation';

interface UseLiveInstallationsParameters {
	initialInstallationId?: number;
}

const APP_SLUG = config( 'github_app_slug' );
const NOTICE_ID = 'github-app-install-notice';

const AUTHORIZATION_URL = addQueryArgs( 'https://github.com/login/oauth/authorize', {
	client_id: config( 'github_oauth_client_id' ),
} );

const INSTALLATION_URL = `https://github.com/apps/${ APP_SLUG }/installations/new`;

export const useLiveInstallations = ( {
	initialInstallationId,
}: UseLiveInstallationsParameters = {} ) => {
	const {
		data: installations,
		error: installationsError,
		refetch,
		isLoading: isLoadingInstallations,
	} = useGithubInstallationsQuery();
	const dispatch = useDispatch();
	const { __ } = useI18n();
	const { saveGitHubCredentials } = useSaveGitHubCredentialsMutation();
	const [ installation, setInstallation ] = useState< GitHubInstallationData >();

	useLayoutEffect( () => {
		if ( installation || ! installations || installations.length === 0 ) {
			return;
		}

		if ( initialInstallationId ) {
			const preselectedInstallation = installations.find(
				( installation ) => installation.external_id === initialInstallationId
			);

			if ( preselectedInstallation ) {
				setInstallation( preselectedInstallation );
				return;
			}
		}

		setInstallation( installations[ 0 ] );
	}, [ installations, installation, initialInstallationId ] );

	const authorizeApp = async ( { code }: { code: string } ) => {
		const response = await postLoginRequest( 'exchange-social-auth-code', {
			service: 'github',
			auth_code: code,
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_key' ),
		} );

		if ( response.body.data.access_token ) {
			await saveGitHubCredentials( { accessToken: response.body.data.access_token } );
		}
	};

	const onNewInstallationRequest = () => {
		const openedPopup = openPopup( {
			url: installationsError?.name === 'UnauthorizedError' ? AUTHORIZATION_URL : INSTALLATION_URL,
			popupId: 'github-app-installation',
			onMessage: async ( data, popup ) => {
				if ( 'github-app-authorized' === data.type ) {
					try {
						await authorizeApp( { code: data.code } );
						popup.location = INSTALLATION_URL;
					} catch {
						popup.close();

						dispatch(
							errorNotice( __( 'Failed to authorize GitHub. Please try again.' ), {
								duration: 5000,
							} )
						);
					}
				}

				if ( 'github-app-installed' === data.type ) {
					popup.close();

					const { installationId } = data as { installationId?: number };

					if ( ! installationId ) {
						dispatch(
							infoNotice(
								__(
									'Installation requested. You will be able to see it once approved by the organization owner.'
								),
								{
									id: NOTICE_ID,
									showDismiss: true,
								}
							)
						);
					}

					const { data: newInstallations } = await refetch();

					const newInstallation = newInstallations?.find(
						( installation ) => installation.external_id === installationId
					);

					if ( newInstallation ) {
						setInstallation( newInstallation );
					}
				}
			},
		} );

		if ( ! openedPopup ) {
			dispatch(
				errorNotice( __( 'Failed to authorize GitHub. Please try again.' ), {
					duration: 5000,
				} )
			);
		}
	};

	return {
		installation,
		onNewInstallationRequest,
		setInstallation,
		installations: installations ?? [],
		isLoadingInstallations,
	};
};
