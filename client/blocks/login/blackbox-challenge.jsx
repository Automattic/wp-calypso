import clsx from 'clsx';
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
		onSubmitBlockedChange( isChallengeActive || isLoading );
	}, [ isChallengeActive, isLoading, onSubmitBlockedChange ] );

	if ( ! enabled ) {
		return null;
	}

	// The container is a permanent mount point; only a rendered widget takes space.
	return (
		<div
			ref={ containerRef }
			className={ clsx( 'login__form-blackbox-challenge', {
				'has-visible-challenge': hasChallengeContent,
			} ) }
		/>
	);
}
