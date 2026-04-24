import config from '@automattic/calypso-config';
import { useEffect, useState } from 'react';
import { loadBlackboxSdk } from 'calypso/blocks/login/utils/blackbox-sdk';

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
					onChallengeStart: () => setIsChallengeActive( true ),
					onChallengeComplete: () => setIsChallengeActive( false ),
				} );
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
