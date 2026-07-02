import { useEffect, useLayoutEffect, useRef } from 'react';
import { useBlackbox } from 'calypso/blocks/login/utils/use-blackbox';

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Renders the Blackbox challenge container and manages SDK lifecycle.
 * Communicates submit-blocking state back to the parent via onSubmitBlockedChange.
 * @param {Object}   props
 * @param {boolean}  props.enabled Whether Blackbox is active for this surface.
 * @param {Function} props.onSubmitBlockedChange Called with true/false when Blackbox should block submit.
 */
export default function BlackboxChallenge( { enabled, onSubmitBlockedChange } ) {
	const containerRef = useRef( null );
	const { isChallengeActive, isLoading, hasChallengeContent } = useBlackbox( {
		containerRef,
		enabled,
	} );

	useIsomorphicLayoutEffect( () => {
		onSubmitBlockedChange( isChallengeActive || isLoading || hasChallengeContent );
	}, [ isChallengeActive, isLoading, hasChallengeContent, onSubmitBlockedChange ] );

	if ( ! enabled ) {
		return null;
	}

	return <div ref={ containerRef } className="login__form-blackbox-challenge" />;
}
