import config from '@automattic/calypso-config';
import { useEffect, useState } from 'react';
import { loadBlackboxSdk } from 'calypso/blocks/login/utils/blackbox-sdk';

// Tracks whether configure() has been called at least once across mounts.
// On remount (e.g. back from 2FA), we call reset() to start a fresh session
// so the new challenge container can surface a challenge.
let hasConfiguredOnce = false;

/**
 * Hook that loads the Blackbox SDK, calls configure() with the given container
 * ref and challenge callbacks, and tracks whether a challenge is active.
 * @param {Object}  options
 * @param {import('react').RefObject<HTMLDivElement>} options.containerRef Ref to the challenge container element.
 * @returns {{ isChallengeActive: boolean }}
 */
export function useBlackbox( { containerRef } ) {
	const [ isChallengeActive, setIsChallengeActive ] = useState( false );

	useEffect( () => {
		if ( ! config.isEnabled( 'blackbox-login' ) || ! config( 'blackbox_api_key' ) ) {
			return;
		}

		let cancelled = false;

		loadBlackboxSdk().then( () => {
			if ( cancelled ) {
				return;
			}

			if ( typeof window.Blackbox?.configure !== 'function' ) {
				return;
			}

			try {
				window.Blackbox.configure( {
					apiKey: config( 'blackbox_api_key' ),
					challengeContainer: containerRef.current,
					onChallengeStart: () => {
						if ( ! cancelled ) {
							setIsChallengeActive( true );
						}
					},
					onChallengeComplete: () => {
						if ( ! cancelled ) {
							setIsChallengeActive( false );
						}
					},
					onChallengeFailure: () => {
						if ( ! cancelled ) {
							setIsChallengeActive( false );
						}
					},
				} );

				if ( hasConfiguredOnce && typeof window.Blackbox.reset === 'function' ) {
					// Remount (e.g. user navigated back from 2FA): clear the
					// stale session and kick off a fresh collect so the SDK can
					// surface a challenge in the new container.
					window.Blackbox.reset();
				}

				hasConfiguredOnce = true;
			} catch {
				// Intentionally ignored — Blackbox must never block login.
			}
		} );

		return () => {
			cancelled = true;
		};
	}, [ containerRef ] );

	return { isChallengeActive };
}
