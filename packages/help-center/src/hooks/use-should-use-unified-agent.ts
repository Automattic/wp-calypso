/* eslint-disable no-restricted-imports */
import config from '@automattic/calypso-config';
import { useSupportStatus } from '../data/use-support-status';

function isUnifiedAgentFlagSetInURL(): boolean {
	const currentUrl = window.location.href;
	const urlParams = new URLSearchParams( new URL( currentUrl ).search );
	return urlParams.get( 'flags' ) === 'unified-agent';
}

export const useShouldUseUnifiedAgent = () => {
	const { data: supportStatus } = useSupportStatus();

	// Check if user is eligible via support status API
	// Note: This will need to be added to the backend support-status endpoint
	const isEligibleViaAPI = Boolean( ( supportStatus?.eligibility as any )?.unified_agent_enabled );

	// Force unified agent via URL flag (for testing)
	const isFlagSetInURL = isUnifiedAgentFlagSetInURL();

	// Unified agent can be enabled via config
	const isConfigEnabled = config.isEnabled( 'unified-agent' );

	const shouldUse = isEligibleViaAPI || isFlagSetInURL || isConfigEnabled;

	// Debug logging
	// eslint-disable-next-line no-console
	console.log( '[useShouldUseUnifiedAgent]', {
		isEligibleViaAPI,
		isFlagSetInURL,
		isConfigEnabled,
		shouldUse,
		supportStatus,
		configData: typeof window !== 'undefined' ? ( window as any ).configData : null,
	} );

	return shouldUse;
};
