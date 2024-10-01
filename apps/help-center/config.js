/* global helpCenterData */
import {
	ZENDESK_STAGING_SUPPORT_CHAT_KEY,
	ZENDESK_SUPPORT_CHAT_KEY,
} from '@automattic/zendesk-client/src/constants';

window.configData = {
	env_id: helpCenterData?.isProxied ? 'staging' : 'production',
	zendesk_support_chat_key: helpCenterData?.isProxied
		? ZENDESK_STAGING_SUPPORT_CHAT_KEY
		: ZENDESK_SUPPORT_CHAT_KEY,
	features: {
		'help/gpt-response': true,
	},
	wapuu: false,
};
