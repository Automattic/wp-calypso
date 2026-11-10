import config from '@automattic/calypso-config';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import BlackboxChallenge from 'calypso/blocks/login/blackbox-challenge';
import { getBlackboxApiKey } from 'calypso/blocks/login/utils/blackbox-sdk';
import {
	activateBlackboxSurface,
	getBlackboxSignal,
} from 'calypso/blocks/login/utils/blackbox-surface';
import { getBlackboxSessionId } from 'calypso/blocks/login/utils/get-blackbox-session-id';
import type { ReactElement } from 'react';

export interface BlackboxProtection {
	/** Whether the submit button should be disabled. */
	isSubmitBlocked: boolean;
	/** Challenge container element to render in the form. */
	challenge: ReactElement;
	/** Resolves an ID, undefined without a session, or null when the form becomes inactive. */
	getSessionId: () => Promise< string | undefined | null >;
	/** Reset for a fresh attempt; an expected ID restricts reset to this active form and session. */
	reset: ( expectedSessionId?: string ) => void;
}

interface UseBlackboxProtectionOptions {
	/**
	 * Feature flag gating Blackbox for this surface. Form is only protected when
	 * this flag is enabled and that surface's public key is configured.
	 * When disabled, `getSessionId` is a no-op so no SDK load/collect happens.
	 */
	feature: string;
	/** Collect flow sent as `X-Blackbox-Flow`. */
	flow: 'login' | 'signup';
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

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Wire Blackbox into a form.
 */
export function useBlackboxProtection( {
	feature,
	flow,
	suspended,
	resetOnError,
}: UseBlackboxProtectionOptions ): BlackboxProtection {
	const apiKey = getBlackboxApiKey();
	const enabled =
		! suspended && !! apiKey && config.isEnabled( 'blackbox' ) && config.isEnabled( feature );
	const [ challengeBlocksSubmit, setChallengeBlocksSubmit ] = useState( enabled );

	// Register before paint so a submit can never see the previous surface.
	const surfaceSignal = useRef< AbortSignal | undefined >( undefined );
	useIsomorphicLayoutEffect( () => {
		if ( ! enabled ) {
			return;
		}
		const { signal, deactivate } = activateBlackboxSurface( apiKey );
		surfaceSignal.current = signal;
		return () => {
			deactivate();
			if ( surfaceSignal.current === signal ) {
				surfaceSignal.current = undefined;
			}
		};
	}, [ enabled, apiKey ] );

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
		() =>
			apiKey
				? getBlackboxSessionId( apiKey, surfaceSignal.current, flow )
				: Promise.resolve( undefined ),
		[ apiKey, flow ]
	);

	const reset = useCallback(
		( expectedSessionId?: string ) => {
			try {
				if (
					expectedSessionId !== undefined &&
					( ! surfaceSignal.current ||
						surfaceSignal.current.aborted ||
						getBlackboxSignal( apiKey ) !== surfaceSignal.current ||
						window.Blackbox?.getSnapshot?.().sessionId !== expectedSessionId )
				) {
					return;
				}
				window.Blackbox?.reset?.();
			} catch {
				// Intentionally ignored — Blackbox must never block the host form.
			}
		},
		[ apiKey ]
	);

	useEffect( () => {
		if ( enabled && resetOnError ) {
			reset();
		}
	}, [ enabled, resetOnError, reset ] );

	return {
		isSubmitBlocked: challengeBlocksSubmit,
		challenge: (
			<BlackboxChallenge
				enabled={ enabled }
				apiKey={ apiKey }
				flow={ flow }
				onSubmitBlockedChange={ handleSubmitBlockedChange }
			/>
		),
		getSessionId: enabled ? getSessionId : noopGetSessionId,
		reset,
	};
}
