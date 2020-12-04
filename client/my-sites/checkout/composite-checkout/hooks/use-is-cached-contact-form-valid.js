/**
 * External dependencies
 */
import { useEffect, useRef, useState } from 'react';
import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { useSelector } from 'react-redux';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import getContactDetailsCache from 'calypso/state/selectors/get-contact-details-cache';

const debug = debugFactory( 'calypso:composite-checkout:use-is-cached-contact-form-valid' );

export default function useIsCachedContactFormValid( contactValidationCallback ) {
	const cachedContactDetails = useSelector( getContactDetailsCache );
	const hasValidated = useRef( false );
	const shouldResetFormStatus = useRef( false );
	const { formStatus, setFormValidating, setFormReady } = useFormStatus();
	const [ isFormValid, setFormValid ] = useState( false );

	useEffect( () => {
		if ( ! contactValidationCallback ) {
			debug( 'Cannot validate contact details; no validation callback' );
			return;
		}
		if ( ! hasValidated.current && cachedContactDetails ) {
			hasValidated.current = true;
			if ( formStatus === FormStatus.READY ) {
				setFormValidating();
				shouldResetFormStatus.current = true;
			}
			contactValidationCallback()
				.then( ( areDetailsCompleteAndValid ) => {
					// If the details are already populated and valid, jump to payment method step
					if ( areDetailsCompleteAndValid ) {
						setFormValid( true );
						debug( 'Contact details are already populated and valid' );
					} else {
						debug( 'Contact details are already populated but not valid' );
					}
					if ( shouldResetFormStatus.current ) {
						setFormReady();
					}
				} )
				.catch( () => {
					if ( shouldResetFormStatus.current ) {
						setFormReady();
					}
				} );
		}
	}, [
		formStatus,
		setFormReady,
		setFormValidating,
		cachedContactDetails,
		contactValidationCallback,
	] );

	return isFormValid;
}
