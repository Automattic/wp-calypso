import config from '@automattic/calypso-config';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useBlackbox } from 'calypso/blocks/login/utils/use-blackbox';

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Renders the Blackbox challenge container and manages SDK lifecycle.
 * Communicates submit-blocking state back to the parent via onSubmitBlockedChange.
 * @param {Object}   props
 * @param {Function} props.onSubmitBlockedChange Called with true/false when Blackbox should block submit.
 */
export default function BlackboxChallenge( { onSubmitBlockedChange } ) {
	const containerRef = useRef( null );
	const { isChallengeActive, isLoading, hasChallengeContent } = useBlackbox( { containerRef } );

	useIsomorphicLayoutEffect( () => {
		onSubmitBlockedChange( isChallengeActive || isLoading || hasChallengeContent );
	}, [ isChallengeActive, isLoading, hasChallengeContent, onSubmitBlockedChange ] );

	if ( ! config.isEnabled( 'blackbox-login' ) || ! config( 'blackbox_api_key' ) ) {
		return null;
	}

	return <div ref={ containerRef } className="login__form-blackbox-challenge" />;
}
