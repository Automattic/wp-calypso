import { githubInstallationsQuery, saveGitHubCredentialsMutation } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { useI18n } from '@wordpress/react-i18n';
import { postLoginRequest } from '../../../state/login/utils';
import { useAnalytics } from '../../app/analytics';

const AUTHORIZATION_URL =
	'https://public-api.wordpress.com/wpcom/v2/hosting/github/app-authorize?ux_mode=popup';
const INSTALLATION_URL = 'https://public-api.wordpress.com/wpcom/v2/hosting/github/app-install';
const NOTICE_ID = 'github-app-install-notice';

interface OpenPopupOptions {
	url: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onMessage( message: any, popup: Window ): void;
}

const openPopup = ( { url, onMessage }: OpenPopupOptions ) => {
	let popup: Window | null;

	try {
		const width = 700;
		const height = 600;

		const top = window.screen.height / 2 - height / 2;
		const left = window.screen.width / 2 - width / 2;

		popup = window.open(
			url,
			undefined,
			`popup=1,width=${ width },height=${ height },top=${ top },left=${ left }`
		);
	} catch {
		return false;
	}

	const handleMessage = ( event: MessageEvent ) => {
		const { data } = event;

		if ( ! data || ! popup ) {
			return;
		}

		onMessage( data, popup );
	};

	window.addEventListener( 'message', handleMessage );

	const interval = window.setInterval( () => {
		if ( ! popup || popup.closed ) {
			clearInterval( interval );
			window.removeEventListener( 'message', handleMessage );
		}
	}, 500 );

	return true;
};

export const useInstallGithub = () => {
	const { error: githubInstallationsError } = useQuery( githubInstallationsQuery() );
	const { recordTracksEvent } = useAnalytics();
	const { __ } = useI18n();
	const { createInfoNotice, createErrorNotice } = useDispatch( noticesStore );
	const { mutate: saveGitHubCredentials } = useMutation( saveGitHubCredentialsMutation() );

	recordTracksEvent( 'calypso_hosting_github_app_open_auth_popup_requested' );

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

	const installGithub = ( { onSuccess }: { onSuccess: ( installationId: number ) => void } ) => {
		const openedPopup = openPopup( {
			url:
				githubInstallationsError?.name === 'UnauthorizedError'
					? AUTHORIZATION_URL
					: INSTALLATION_URL,
			onMessage: async ( data, popup ) => {
				if ( 'github-app-authorized' === data.type ) {
					recordTracksEvent( 'calypso_hosting_github_app_authorised_success' );

					try {
						await authorizeApp( { code: data.code } );
						popup.location = INSTALLATION_URL;
					} catch {
						popup.close();

						recordTracksEvent( 'calypso_hosting_github_app_install_failed' );

						createErrorNotice( __( 'Failed to authorize GitHub. Please try again.' ), {
							duration: 5000,
						} );
					}
				}

				if ( 'github-app-installed' === data.type ) {
					popup.close();

					const { installationId } = data as { installationId?: number };

					recordTracksEvent( 'calypso_hosting_github_app_install_success', {
						is_org_request: ! installationId,
					} );

					if ( ! installationId ) {
						createInfoNotice(
							__(
								'Installation requested. You will be able to see it once approved by the organization owner.'
							),
							{
								id: NOTICE_ID,
								showDismiss: true,
							}
						);
						return;
					}

					onSuccess( installationId );
				}
			},
		} );

		if ( ! openedPopup ) {
			recordTracksEvent( 'calypso_hosting_github_app_install_failed' );

			createErrorNotice( __( 'Failed to authorize GitHub. Please try again.' ), {
				duration: 5000,
			} );
		}
	};

	return { installGithub };
};
