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

	// All users eligible for support should see the Wapuu assistant.
	const isEligibleForSupport = Boolean( supportStatus?.eligibility?.is_user_eligible );

	// Force Wapuu via URL flag (config is not available in wp-admin)
	const isFlagSetInURL = isWapuuFlagSetInURL();

	// Wapuu can be enabled via config
	const isConfigEnabled = config.isEnabled( 'wapuu' );

	return isEligibleForSupport || isFlagSetInURL || isConfigEnabled;
};
