import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useBlackbox } from 'calypso/blocks/login/utils/use-blackbox';

import './blackbox-challenge.scss';

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

// The SDK's first load usually ends sooner, and a message that flashes by reads as a glitch.
const SLOW_LOAD_MS = 1000;

function useIsSlowToLoad( isLoading ) {
	const [ isSlow, setIsSlow ] = useState( false );

	useEffect( () => {
		if ( ! isLoading ) {
			setIsSlow( false );
			return;
		}
		const timeout = setTimeout( () => setIsSlow( true ), SLOW_LOAD_MS );
		return () => clearTimeout( timeout );
	}, [ isLoading ] );

	return isLoading && isSlow;
}

/**
 * Renders the Blackbox challenge container and manages SDK lifecycle.
 * Communicates submit-blocking state back to the parent via onSubmitBlockedChange.
 * @param {Object}   props
 * @param {boolean}  props.enabled Whether Blackbox is active for this surface.
 * @param {string}   [props.apiKey] Public key for this surface.
 * @param {'login'|'signup'|'password_reset'} props.flow Collect flow for `X-Blackbox-Flow`.
 * @param {Function} props.onSubmitBlockedChange Called with true/false when Blackbox should block submit.
 */
export default function BlackboxChallenge( { enabled, apiKey, flow, onSubmitBlockedChange } ) {
	const containerRef = useRef( null );
	const { isChallengeActive, isLoading, hasChallengeContent } = useBlackbox( {
		containerRef,
		enabled,
		apiKey,
		flow,
	} );

	const translate = useTranslate();
	const isSlowToLoad = useIsSlowToLoad( isLoading );
	// A raised challenge holds the submit before its widget has anything to show.
	const isCheckLoading = ( isChallengeActive || isSlowToLoad ) && ! hasChallengeContent;

	useIsomorphicLayoutEffect( () => {
		onSubmitBlockedChange( isChallengeActive || isLoading );
	}, [ isChallengeActive, isLoading, onSubmitBlockedChange ] );

	if ( ! enabled ) {
		return null;
	}

	// The container is a permanent mount point; only a rendered widget takes space.
	// The status stays mounted too: a live region added along with its text isn't announced.
	return (
		<>
			<div role="status" className="login__form-blackbox-status">
				{ isCheckLoading && <p>{ translate( 'Loading the security check…' ) }</p> }
			</div>
			<div
				ref={ containerRef }
				className={ clsx( 'login__form-blackbox-challenge', {
					'has-visible-challenge': hasChallengeContent,
				} ) }
			/>
		</>
	);
}
