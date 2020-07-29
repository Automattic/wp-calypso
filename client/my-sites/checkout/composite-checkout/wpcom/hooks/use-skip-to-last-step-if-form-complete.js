/**
 * External dependencies
 */
import { useEffect, useRef } from 'react';
import { useSetStepComplete } from '@automattic/composite-checkout';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:composite-checkout:use-skip-to-last-step-if-form-complete' );

export default function useSkipToLastStepIfFormComplete( isCachedContactFormValid ) {
	const hasDecided = useRef( false );
	const setStepCompleteStatus = useSetStepComplete();

	useEffect( () => {
		if ( ! isCachedContactFormValid ) {
			return;
		}
		if ( ! hasDecided.current ) {
			hasDecided.current = true;
			// If the details are already populated and valid, jump to payment method step
			if ( isCachedContactFormValid ) {
				debug( 'Contact details are already populated; skipping to payment method step' );
				saveStepNumberToUrl( 2 ); // TODO: can we do this dynamically somehow in case the step numbers change?
				setStepCompleteStatus( 1, true ); // TODO: can we do this dynamically somehow in case the step numbers change?
			}
		}
	}, [ isCachedContactFormValid, setStepCompleteStatus ] );
}

function saveStepNumberToUrl( stepNumber ) {
	if ( ! window?.history || ! window?.location ) {
		return;
	}
	const newHash = stepNumber > 1 ? `#step${ stepNumber }` : '';
	if ( window.location.hash === newHash ) {
		return;
	}
	const newUrl = window.location.hash
		? window.location.href.replace( window.location.hash, newHash )
		: window.location.href + newHash;
	debug( 'updating url to', newUrl );
	window.history.replaceState( null, '', newUrl );
	// Modifying history does not trigger a hashchange event which is what
	// composite-checkout uses to change its current step, so we must fire one
	// manually. (HashChangeEvent is part of the web API so I'm not sure why
	// eslint reports this as undefined.)
	const event = new HashChangeEvent( 'hashchange' ); // eslint-disable-line no-undef
	window.dispatchEvent( event );
}
