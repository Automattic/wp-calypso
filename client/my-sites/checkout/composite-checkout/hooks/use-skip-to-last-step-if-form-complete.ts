import { useSetStepComplete } from '@automattic/composite-checkout';
import debugFactory from 'debug';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

const debug = debugFactory( 'calypso:composite-checkout:use-skip-to-last-step-if-form-complete' );

export default function useSkipToLastStepIfFormComplete( shouldSkip: boolean ) {
	const hasDecided = useRef( false );
	const setStepCompleteStatus = useSetStepComplete();
	const reduxDispatch = useDispatch();

	useEffect( () => {
		if ( ! shouldSkip ) {
			return;
		}
		if ( hasDecided.current ) {
			return;
		}
		hasDecided.current = true;
		// If the details are already populated and valid, jump to the payment method step.
		debug( 'Contact details are already populated; skipping to payment method step' );
		reduxDispatch( recordTracksEvent( 'calypso_checkout_skip_to_last_step' ) );
		setStepCompleteStatus( 'contact-form' );
	}, [ shouldSkip, setStepCompleteStatus, reduxDispatch ] );
}
