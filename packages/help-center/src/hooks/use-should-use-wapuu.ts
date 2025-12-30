/* eslint-disable no-restricted-imports */
import config from '@automattic/calypso-config';
import { useSupportStatus } from '../data/use-support-status';

function isWapuuFlagSetInURL(): boolean {
	const currentUrl = window.location.href;
	const urlParams = new URLSearchParams( new URL( currentUrl ).search );
	return urlParams.get( 'flags' ) === 'wapuu';
}

export const useShouldUseWapuu = () => {
	const { data: supportStatus } = useSupportStatus();
	// Only disable when explicitly disabled in the support status.
	const wapuuAssistantDisabled = supportStatus?.eligibility?.wapuu_assistant_enabled === false;

	// Force Wapuu via URL flag (config is not available in wp-admin)
	const isFlagSetInURL = isWapuuFlagSetInURL();

	// Wapuu can be enabled via config
	const isConfigEnabled = config.isEnabled( 'wapuu' );

	return ! wapuuAssistantDisabled || isFlagSetInURL || isConfigEnabled;
};
