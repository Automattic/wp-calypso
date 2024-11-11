/* global helpCenterData */
import {
	ZENDESK_STAGING_SUPPORT_CHAT_KEY,
	ZENDESK_SUPPORT_CHAT_KEY,
} from '@automattic/zendesk-client/src/constants';

const isProxied = typeof helpCenterData !== 'undefined' && helpCenterData?.isProxied;
const flags = new URLSearchParams( window.location.search ).get( 'flags' );
const isHelpCenterExperienceEnabled = flags?.includes( 'help-center-experience' ) ?? false;

window.configData = {
	env_id: isProxied ? 'staging' : 'production',
	zendesk_support_chat_key: isProxied ? ZENDESK_STAGING_SUPPORT_CHAT_KEY : ZENDESK_SUPPORT_CHAT_KEY,
	features: {
		'help/gpt-response': true,
		'help-center-experience': isHelpCenterExperienceEnabled,
	},
	wapuu: false,
};
