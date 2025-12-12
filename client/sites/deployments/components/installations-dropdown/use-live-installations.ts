import config from '@automattic/calypso-config';
import { useI18n } from '@wordpress/react-i18n';
import { useLayoutEffect, useState } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { postLoginRequest } from 'calypso/state/login/utils';
import { infoNotice, errorNotice } from 'calypso/state/notices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useCodeDeploymentsQuery } from '../../deployments/use-code-deployments-query';
import {
	GitHubInstallationData,
	useGithubInstallationsQuery,
} from '../../use-github-installations-query';
import { openPopup } from '../../utils/open-popup';
import { useSaveGitHubCredentialsMutation } from './use-save-github-credentials-mutation';

const NOTICE_ID = 'github-app-install-notice';

const AUTHORIZATION_URL =
	'https://public-api.wordpress.com/wpcom/v2/hosting/github/app-authorize?ux_mode=popup';

const INSTALLATION_URL = 'https://public-api.wordpress.com/wpcom/v2/hosting/github/app-install';

export const useLiveInstallations = () => {
	const siteId = useSelector( getSelectedSiteId );
	const {
		data: installations,
		error: installationsError,
		refetch,
		isLoading: isLoadingInstallations,
	} = useGithubInstallationsQuery();
	const { data: deployments = [] } = useCodeDeploymentsQuery( siteId );
	const dispatch = useDispatch();
	const { __ } = useI18n();
	const { saveGitHubCredentials } = useSaveGitHubCredentialsMutation();
	const [ installation, setInstallation ] = useState< GitHubInstallationData >();

	useLayoutEffect( () => {
		if ( installation || ! installations || installations.length === 0 ) {
			return;
		}

		// If there are existing deployments, try to pre-select the installation
		// that matches the first deployment's installation_id
		if ( deployments.length > 0 ) {
			const firstDeploymentInstallationId = deployments[ 0 ]?.installation_id;
			if ( firstDeploymentInstallationId ) {
				const preselectedInstallation = installations.find(
					( inst ) => inst.external_id === firstDeploymentInstallationId
				);
				if ( preselectedInstallation ) {
					setInstallation( preselectedInstallation );
					return;
				}
			}
		}

		// Fallback to first installation
		setInstallation( installations[ 0 ] );
	}, [ installations, installation, deployments ] );

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
		dispatch( recordTracksEvent( 'calypso_hosting_github_app_open_auth_popup_requested' ) );

		const openedPopup = openPopup( {
			url: installationsError?.name === 'UnauthorizedError' ? AUTHORIZATION_URL : INSTALLATION_URL,
			onMessage: async ( data, popup ) => {
				if ( 'github-app-authorized' === data.type ) {
					dispatch( recordTracksEvent( 'calypso_hosting_github_app_authorised_success' ) );

					try {
						await authorizeApp( { code: data.code } );
						refetch();
						popup.location = INSTALLATION_URL;
					} catch {
						popup.close();

						dispatch( recordTracksEvent( 'calypso_hosting_github_app_install_failed' ) );

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

					dispatch(
						recordTracksEvent( 'calypso_hosting_github_app_install_success', {
							is_org_request: ! installationId,
						} )
					);

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
			dispatch( recordTracksEvent( 'calypso_hosting_github_app_install_failed' ) );

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
