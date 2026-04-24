import config from '@automattic/calypso-config';
import { useEffect, useRef } from 'react';
import { useBlackbox } from 'calypso/blocks/login/utils/use-blackbox';

/**
 * Renders the Blackbox challenge container and manages SDK lifecycle.
 * Communicates challenge state back to the parent via onChallengeActiveChange.
 * @param {Object}   props
 * @param {Function} props.onChallengeActiveChange Called with true/false when challenge state changes.
 */
export default function BlackboxChallenge( { onChallengeActiveChange } ) {
	const containerRef = useRef( null );
	const { isChallengeActive } = useBlackbox( { containerRef } );

	useEffect( () => {
		onChallengeActiveChange( isChallengeActive );
	}, [ isChallengeActive, onChallengeActiveChange ] );

	if ( ! config.isEnabled( 'blackbox-login' ) || ! config( 'blackbox_api_key' ) ) {
		return null;
	}

	return <div ref={ containerRef } className="login__form-blackbox-challenge" />;
}
