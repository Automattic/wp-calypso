import { useEffect, useState, useSyncExternalStore } from 'react';
import { loadBlackboxSdk } from 'calypso/blocks/login/utils/blackbox-sdk';
import {
	activateBlackboxSurface,
	configureBlackbox,
} from 'calypso/blocks/login/utils/blackbox-surface';

const LOADING_SNAPSHOT = Object.freeze( { status: 'loading' } );
const getLoadingSnapshot = () => LOADING_SNAPSHOT;
const subscribeWithoutSdk = () => () => {};
const BLACKBOX_FAIL_OPEN_TIMEOUT_MS = 5000;

/** Connect SDK state and the challenge container to the active form. */
export function useBlackbox( { containerRef, enabled, apiKey } ) {
	const isEnabled = enabled && !! apiKey;
	const [ loaded, setLoaded ] = useState( null );
	const api = isEnabled && loaded?.apiKey === apiKey ? loaded.api : undefined;
	const snapshot = useSyncExternalStore(
		api?.subscribe ?? subscribeWithoutSdk,
		api?.getSnapshot ?? getLoadingSnapshot,
		getLoadingSnapshot
	);
	const [ loadingExpired, setLoadingExpired ] = useState( false );
	const [ hasChallengeContent, setHasChallengeContent ] = useState( false );

	useEffect( () => {
		setLoadingExpired( false );
		if ( ! isEnabled || snapshot.status !== 'loading' ) {
			return;
		}
		const timeout = setTimeout( () => setLoadingExpired( true ), BLACKBOX_FAIL_OPEN_TIMEOUT_MS );
		return () => clearTimeout( timeout );
	}, [ isEnabled, apiKey, snapshot.status ] );

	useEffect( () => {
		const container = containerRef.current;
		setHasChallengeContent( false );
		if ( ! isEnabled || ! container || typeof window.ResizeObserver !== 'function' ) {
			return;
		}
		const updateHasChallengeContent = () => setHasChallengeContent( container.offsetHeight > 0 );
		const observer = new window.ResizeObserver( updateHasChallengeContent );
		updateHasChallengeContent();
		observer.observe( container );
		return () => observer.disconnect();
	}, [ containerRef, isEnabled ] );

	useEffect( () => {
		setLoaded( null );
		if ( ! isEnabled ) {
			return;
		}
		const controller = activateBlackboxSurface( apiKey );
		loadBlackboxSdk( apiKey )
			.then( () => {
				if ( controller.signal.aborted ) {
					return;
				}
				const sdk = window.Blackbox;
				if ( ! sdk?.configure || ! sdk.subscribe || ! sdk.getSnapshot || ! sdk.flush ) {
					setLoadingExpired( true );
					return;
				}
				try {
					configureBlackbox(
						sdk,
						{
							apiKey,
							challengeContainer: containerRef.current,
							challengeMaxWidth: '100%',
						},
						true
					);
					setLoaded( { api: sdk, apiKey } );
				} catch {
					setLoadingExpired( true );
				}
			} )
			.catch( () => {
				if ( ! controller.signal.aborted ) {
					setLoadingExpired( true );
				}
			} );
		return () => controller.abort();
	}, [ apiKey, containerRef, isEnabled ] );

	return {
		isChallengeActive: isEnabled && snapshot.status === 'challenge',
		isLoading: isEnabled && snapshot.status === 'loading' && ! loadingExpired,
		hasChallengeContent: isEnabled && hasChallengeContent,
	};
}
