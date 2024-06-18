/* eslint-disable no-restricted-imports */
import config from '@automattic/calypso-config';
import { useSupportAvailability } from '../data/use-support-availability';

export const useShouldUseWapuu = () => {
	const { data: supportAvailability } = useSupportAvailability();

	// All users eligible for support should see the Wapuu assistant.
	const isEligibleForSupport = Boolean( supportAvailability?.is_user_eligible );

	// Wapuu can be enabled via config/flag
	const isConfigEnabled = config.isEnabled( 'wapuu' );

	return isEligibleForSupport || isConfigEnabled;
};
