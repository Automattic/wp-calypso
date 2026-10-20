import { useMutation } from '@tanstack/react-query';
import { SMOOCH_APP_ID, SMOOCH_APP_ID_STAGING, WIDGET_URL, WIDGET_URL_STAGING } from './constants';
import { getSmoochIntegrationId, isTestModeEnvironment } from './util';
import type { SmoochIntegrationKey } from './types';

export const useAttachFileToConversation = () => {
	return useMutation( {
		mutationFn: ( {
			authData,
			clientId,
			conversationId,
			file,
			integrationKey,
		}: {
			authData: { isLoggedIn: boolean; jwt: string; externalId: string | undefined };
			clientId: string;
			conversationId: string;
			file: File;
			/** The integration Smooch was initialized with. Defaults to the WordPress.com one. */
			integrationKey?: SmoochIntegrationKey | null;
		} ) => {
			const isTestMode = isTestModeEnvironment();
			const integrationId = getSmoochIntegrationId( integrationKey );
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
