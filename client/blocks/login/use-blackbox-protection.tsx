import config from '@automattic/calypso-config';
import { useCallback, useState } from 'react';
import BlackboxChallenge from 'calypso/blocks/login/blackbox-challenge';
import { getBlackboxSessionId } from 'calypso/blocks/login/utils/get-blackbox-session-id';
import type { ReactElement } from 'react';

export interface BlackboxProtection {
	/** Whether the submit button should be disabled. */
	isSubmitBlocked: boolean;
	/** Challenge container element to render in the form. */
	challenge: ReactElement;
	/** Resolves the Blackbox session ID (no-op when disabled). */
	getSessionId: () => Promise< string | undefined >;
	/** Resets the Blackbox session so a retry starts fresh. */
	reset: () => void;
}

interface UseBlackboxProtectionOptions {
	/**
	 * Feature flag gating Blackbox for this surface. Form is only protected when
	 * this flag is enabled and a `blackbox_api_key` is configured. When disabled,
	 * `getSessionId` is a no-op so no SDK load/collect happens.
	 */
	feature: string;
}

const noopGetSessionId = () => Promise.resolve( undefined );

/**
 * Wire Blackbox into a form.
 */
export function useBlackboxProtection( {
	feature,
}: UseBlackboxProtectionOptions ): BlackboxProtection {
	const enabled =
		!! config( 'blackbox_api_key' ) &&
		config.isEnabled( 'blackbox' ) &&
		config.isEnabled( feature );
	const [ isSubmitBlocked, setIsSubmitBlocked ] = useState( enabled );

	const handleSubmitBlockedChange = useCallback( ( isBlocked: boolean ) => {
		setIsSubmitBlocked( isBlocked );
	}, [] );

	return {
		isSubmitBlocked,
		challenge: (
			<BlackboxChallenge enabled={ enabled } onSubmitBlockedChange={ handleSubmitBlockedChange } />
		),
		getSessionId: enabled ? getBlackboxSessionId : noopGetSessionId,
		reset: () => {
			try {
				window.Blackbox?.reset?.();
			} catch {
				// Intentionally ignored — Blackbox must never block the host form.
			}
		},
	};
}
