import { useMutation } from '@tanstack/react-query';
import {
	SMOOCH_APP_ID,
	SMOOCH_APP_ID_STAGING,
	SMOOCH_INTEGRATION_ID,
	SMOOCH_INTEGRATION_ID_STAGING,
	WIDGET_URL,
	WIDGET_URL_STAGING,
} from './constants';
import { isTestModeEnvironment } from './util';

type MessagePayload = {
	type: 'text' | 'formResponse';
	text?: string;
	payload?: string;
	metadata?: Record< string, any >;
	fields?: Array< {
		type: 'text';
		name: string;
		label: string;
		text: string;
	} >;
	quotedMessageId?: string;
	role: 'appUser';
};

export const useRateChat = () => {
	return useMutation( {
		mutationFn: ( {
			authData,
			clientId,
			conversationId,
			appUserId,
			message,
		}: {
			authData: { isLoggedIn: boolean; jwt: string; externalId: string | undefined };
			clientId: string;
			conversationId: string;
			appUserId: string;
			message: MessagePayload;
		} ) => {
			const isTestMode = isTestModeEnvironment();
			const integrationId = isTestMode ? SMOOCH_INTEGRATION_ID_STAGING : SMOOCH_INTEGRATION_ID;
			const url = isTestMode ? WIDGET_URL_STAGING : WIDGET_URL;
			const appId = isTestMode ? SMOOCH_APP_ID_STAGING : SMOOCH_APP_ID;

			const apiUrl = `${ url }/sc/sdk/v2/apps/${ appId }/conversations/${ conversationId }/messages`;

			const payload = {
				author: {
					role: 'appUser',
					appUserId: appUserId,
					client: {
						platform: 'web',
						id: clientId,
						integrationId: integrationId,
					},
				},
				message,
			};
			return fetch( apiUrl, {
				method: 'POST',
				body: JSON.stringify( payload ),
				credentials: 'include',
				headers: {
					Authorization: `Bearer ${ authData.jwt }`,
					'Content-Type': 'application/json',
					'x-smooch-appid': appId,
					'x-smooch-clientid': clientId,
					'x-smooch-sdk': 'web/zendesk/0.1',
				},
			} );
		},
	} );
};
