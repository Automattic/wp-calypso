/* eslint-disable no-restricted-imports */
import config from '@automattic/calypso-config';
import { useSupportStatus } from '../data/use-support-status';

function isUnifiedAgentFlagSetInURL(): boolean {
	const currentUrl = window.location.href;
	const urlParams = new URLSearchParams( new URL( currentUrl ).search );
	const flags = urlParams.get( 'flags' );
	return flags?.split( ',' ).includes( 'unified-agent' ) ?? false;
}

export const useShouldUseUnifiedAgent = () => {
	const { data: supportStatus } = useSupportStatus();

	// Check if user is eligible via support status API
	// Note: This will need to be added to the backend support-status endpoint
	const isEligibleViaAPI = Boolean( supportStatus?.eligibility?.unified_agent_enabled );

	// Force unified agent via URL flag (for testing)
	const isFlagSetInURL = isUnifiedAgentFlagSetInURL();

	// Unified agent can be enabled via config
	const isConfigEnabled = config.isEnabled( 'unified-agent' );

	return isEligibleViaAPI || isFlagSetInURL || isConfigEnabled;
};
