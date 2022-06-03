import { useSetStepComplete } from '@automattic/composite-checkout';
import { useSelect } from '@wordpress/data';
import debugFactory from 'debug';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type {
	PossiblyCompleteDomainContactDetails,
	ManagedContactDetails,
} from '@automattic/wpcom-checkout';

const debug = debugFactory( 'calypso:composite-checkout:use-skip-to-last-step-if-form-complete' );

export default function useSkipToLastStepIfFormComplete(
	cachedContactDetails: PossiblyCompleteDomainContactDetails
) {
	const contactInfo: ManagedContactDetails = useSelect( ( select ) =>
		select( 'wpcom-checkout' ).getContactInfo()
	);
	const hasSkipped = useRef( false );
	const setStepCompleteStatus = useSetStepComplete();
	const reduxDispatch = useDispatch();

	// If we have cached contact details and they match the contact details in
	// the checkout form, then they have probably been pre-filled. If that is the
	// case, we should attempt to validate them.
	const shouldSkip =
		contactInfo.countryCode?.value &&
		contactInfo.countryCode.value === cachedContactDetails.countryCode;

	useEffect( () => {
		if ( ! shouldSkip ) {
			return;
		}
		if ( hasSkipped.current ) {
			return;
		}
		hasSkipped.current = true;
		// If the details are already populated and valid, jump to the payment method step.
		debug( 'Contact details are already populated; skipping to payment method step' );
		reduxDispatch( recordTracksEvent( 'calypso_checkout_skip_to_last_step' ) );
		setStepCompleteStatus( 'contact-form' );
	}, [ shouldSkip, setStepCompleteStatus, reduxDispatch ] );
}
