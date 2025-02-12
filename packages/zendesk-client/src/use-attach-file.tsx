import config from '@automattic/calypso-config';
import { useMutation } from '@tanstack/react-query';
import {
	SMOOCH_APP_ID,
	SMOOCH_APP_ID_STAGING,
	SMOOCH_INTEGRATION_ID,
	SMOOCH_INTEGRATION_ID_STAGING,
	WIDGET_URL,
	WIDGET_URL_STAGING,
} from './constants';

export const useAttachFileToConversation = () => {
	return useMutation( {
		mutationFn: ( {
			authData,
			clientId,
			conversationId,
			file,
		}: {
			authData: { isLoggedIn: boolean; jwt: string; externalId: string | undefined };
			clientId: string;
			conversationId: string;
			file: File;
		} ) => {
			const currentEnvironment = config( 'env_id' ) as string;
			const isTestMode = ! [ 'production', 'desktop' ].includes( currentEnvironment );

			const integrationId = isTestMode ? SMOOCH_INTEGRATION_ID_STAGING : SMOOCH_INTEGRATION_ID;
			const url = isTestMode ? WIDGET_URL_STAGING : WIDGET_URL;
			const appId = isTestMode ? SMOOCH_APP_ID_STAGING : SMOOCH_APP_ID;

			const formData = new FormData();

			formData.append(
				'author',
				JSON.stringify( {
					role: 'appUser',
					appUserId: authData.externalId,
					client: {
						platform: 'web',
						id: clientId,
						integrationId: integrationId,
					},
				} )
			);
			formData.append( 'message', JSON.stringify( {} ) );
			formData.append( 'source', file );

			return fetch( `${ url }/sc/sdk/v2/apps/${ appId }/conversations/${ conversationId }/files`, {
				method: 'POST',
				body: formData,
				credentials: 'include',
				headers: {
					Authorization: `Bearer ${ authData.jwt }`,
					'x-smooch-appid': appId,
					'x-smooch-clientid': clientId,
					'x-smooch-sdk': 'web/zendesk/0.1',
				},
			} );
		},
	} );
};
