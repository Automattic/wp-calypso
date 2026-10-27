import config from '@automattic/calypso-config';
import { useCallback, useEffect, useRef, useState } from 'react';
import BlackboxChallenge from 'calypso/blocks/login/blackbox-challenge';
import { getBlackboxApiKey } from 'calypso/blocks/login/utils/blackbox-sdk';
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
	 * this flag is enabled and that surface's public key is configured. Signup
	 * surfaces use `blackbox_signup_api_key`; other surfaces use `blackbox_api_key`.
	 * When disabled, `getSessionId` is a no-op so no SDK load/collect happens.
	 */
	feature: string;
	/**
	 * Keep Blackbox off while the host form is mounted but not the active
	 * surface (e.g. hidden behind another step). No collect happens and no
	 * challenge can render until this flips back to false.
	 */
	suspended?: boolean;
	/**
	 * When this becomes a failed result, retire the session and start a
	 * replacement collect. Pass the same value until the next failure.
	 */
	resetOnError?: unknown;
}

const noopGetSessionId = () => Promise.resolve( undefined );

/**
 * Wire Blackbox into a form.
 */
export function useBlackboxProtection( {
	feature,
	suspended,
	resetOnError,
}: UseBlackboxProtectionOptions ): BlackboxProtection {
	const apiKey = getBlackboxApiKey( feature );
	const enabled =
		! suspended && !! apiKey && config.isEnabled( 'blackbox' ) && config.isEnabled( feature );
	const [ challengeBlocksSubmit, setChallengeBlocksSubmit ] = useState( enabled );
	const [ replacementInFlight, setReplacementInFlight ] = useState( false );
	const isSubmitBlocked = challengeBlocksSubmit || replacementInFlight;

	// Re-block during render when a suspended surface re-enables: the challenge
	// only re-blocks from a post-paint effect, which would leave the submit
	// button clickable for a frame.
	const prevEnabled = useRef( enabled );
	if ( prevEnabled.current !== enabled ) {
		prevEnabled.current = enabled;
		setChallengeBlocksSubmit( enabled );
	}

	const handleSubmitBlockedChange = useCallback( ( isBlocked: boolean ) => {
		setChallengeBlocksSubmit( isBlocked );
	}, [] );

	const getSessionId = useCallback(
		() => ( apiKey ? getBlackboxSessionId( apiKey ) : Promise.resolve( undefined ) ),
		[ apiKey ]
	);

	const reset = useCallback( () => {
		try {
			window.Blackbox?.reset?.();
		} catch {
			// Intentionally ignored — Blackbox must never block the host form.
		}
	}, [] );

	useEffect( () => {
		if ( ! enabled || ! resetOnError ) {
			setReplacementInFlight( false );
			return;
		}

		let cancelled = false;
		// reset() aborts the visible challenge before the replacement collect
		// decides, and that abort would re-enable submit. Hold it until the
		// collect settles; a challenge that starts keeps its own block.
		setReplacementInFlight( true );
		reset();
		getSessionId().finally( () => {
			if ( ! cancelled ) {
				setReplacementInFlight( false );
			}
		} );

		return () => {
			cancelled = true;
		};
	}, [ enabled, resetOnError, reset, getSessionId ] );

	return {
		isSubmitBlocked,
		challenge: (
			<BlackboxChallenge
				enabled={ enabled }
				apiKey={ apiKey }
				onSubmitBlockedChange={ handleSubmitBlockedChange }
			/>
		),
		getSessionId: enabled ? getSessionId : noopGetSessionId,
		reset,
	};
}
