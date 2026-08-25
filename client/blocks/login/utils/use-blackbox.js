import { useEffect, useState } from 'react';
import { getBlackboxApiKey, loadBlackboxSdk } from 'calypso/blocks/login/utils/blackbox-sdk';

// Give the SDK a short window to synchronously or near-synchronously start a challenge
// after configure(), avoiding a brief enabled submit button while the widget initializes.
const BLACKBOX_CONFIGURE_SETTLE_TIMEOUT_MS = 500;
const BLACKBOX_FAIL_OPEN_TIMEOUT_MS = 5000;

// Tracks whether configure() has been called at least once across mounts.
// On remount (e.g. back from 2FA), we call reset() to start a fresh session
// so the new challenge container can surface a challenge.
let hasConfiguredOnce = false;

/**
 * Hook that loads the Blackbox SDK, calls configure() with the given container
 * ref and challenge callbacks, and tracks whether a challenge is active.
 * @param {Object}  options
 * @param {import('react').RefObject<HTMLDivElement>} options.containerRef Ref to the challenge container element.
 * @param {boolean} options.enabled Whether Blackbox is active for this surface.
 * @returns {{ isChallengeActive: boolean, isLoading: boolean, hasChallengeContent: boolean }}
 */
export function useBlackbox( { containerRef, enabled } ) {
	const isEnabled = enabled;
	const [ isChallengeActive, setIsChallengeActive ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( isEnabled );
	const [ hasChallengeContent, setHasChallengeContent ] = useState( false );

	useEffect( () => {
		const container = containerRef.current;

		if ( ! isEnabled || ! container || typeof window.ResizeObserver !== 'function' ) {
			return;
		}

		const updateHasChallengeContent = () => {
			setHasChallengeContent( container.offsetHeight > 0 );
		};
		const observer = new window.ResizeObserver( updateHasChallengeContent );

		updateHasChallengeContent();
		observer.observe( container );

		return () => {
			observer.disconnect();
		};
	}, [ containerRef, isEnabled ] );

	useEffect( () => {
		if ( ! isEnabled ) {
			// Covers the surface being suspended after a challenge appeared: drop
			// all blocking state so the form isn't wedged when it re-enables.
			setIsLoading( false );
			setIsChallengeActive( false );
			setHasChallengeContent( false );
			return;
		}

		// The initial state only covers enabled-at-mount; this covers a surface
		// that enables later (e.g. a hidden signup step becoming active).
		setIsLoading( true );

		let cancelled = false;
		let hasStartedChallenge = false;
		let settleTimeout;
		const failOpenTimeout = setTimeout( () => {
			if ( ! cancelled ) {
				setIsLoading( false );
			}
		}, BLACKBOX_FAIL_OPEN_TIMEOUT_MS );

		const clearPendingTimeouts = () => {
			clearTimeout( settleTimeout );
			clearTimeout( failOpenTimeout );
		};

		const stopLoading = () => {
			clearPendingTimeouts();
			if ( ! cancelled ) {
				setIsLoading( false );
			}
		};

		loadBlackboxSdk().then( () => {
			if ( cancelled ) {
				return;
			}

			if ( typeof window.Blackbox?.configure !== 'function' ) {
				stopLoading();
				return;
			}

			try {
				window.Blackbox.configure( {
					apiKey: getBlackboxApiKey(),
					challengeContainer: containerRef.current,
					// Fill the login form column so the challenge lines up with the
					// input above and the full-width Continue button below.
					challengeMaxWidth: '100%',
					onChallengeStart: () => {
						if ( ! cancelled ) {
							hasStartedChallenge = true;
							stopLoading();
							setIsChallengeActive( true );
						}
					},
					onChallengeComplete: () => {
						if ( ! cancelled ) {
							if ( hasStartedChallenge ) {
								stopLoading();
							}
							setIsChallengeActive( false );
						}
					},
					onChallengeFailure: () => {
						if ( ! cancelled ) {
							if ( hasStartedChallenge ) {
								stopLoading();
							}
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
				settleTimeout = setTimeout( stopLoading, BLACKBOX_CONFIGURE_SETTLE_TIMEOUT_MS );
			} catch {
				// Intentionally ignored — Blackbox must never block login.
				stopLoading();
			}
		} );

		return () => {
			cancelled = true;
			clearPendingTimeouts();
		};
	}, [ containerRef, isEnabled ] );

	return { isChallengeActive, isLoading, hasChallengeContent };
}
