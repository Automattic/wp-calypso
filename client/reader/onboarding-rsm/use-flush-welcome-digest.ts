import { flushOnboardingWelcomeDigestMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';

/**
 * Fire-and-forget flush for the Reader onboarding welcome digest.
 * Errors are swallowed so Finish UI is never blocked.
 */
export const useFlushWelcomeDigest = () => {
	const { mutate } = useMutation( flushOnboardingWelcomeDigestMutation() );

	return useCallback( () => {
		mutate( undefined, { onError: () => {} } );
	}, [ mutate ] );
};
