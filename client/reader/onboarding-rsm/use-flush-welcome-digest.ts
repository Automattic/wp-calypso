import { flushOnboardingWelcomeDigest } from '@automattic/api-core';
import { useCallback } from 'react';

/**
 * Fire-and-forget flush for the Reader onboarding welcome digest.
 * Errors are swallowed so Finish UI is never blocked.
 */
export const useFlushWelcomeDigest = () =>
	useCallback( () => {
		void flushOnboardingWelcomeDigest().catch( () => {} );
	}, [] );
