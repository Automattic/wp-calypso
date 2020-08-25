/**
 * External dependencies
 */
import { useEffect, useState } from 'react';
import { useSelector, useDispatch as useReduxDispatch } from 'react-redux';
import { defaultRegistry } from '@automattic/composite-checkout';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import getContactDetailsCache from 'state/selectors/get-contact-details-cache';
import { requestContactDetailsCache } from 'state/domains/management/actions';

const { dispatch } = defaultRegistry;

const debug = debugFactory( 'calypso:composite-checkout:use-cached-domain-contact-details' );

export default function useCachedDomainContactDetails() {
	const reduxDispatch = useReduxDispatch();
	const [ haveRequestedCachedDetails, setHaveRequestedCachedDetails ] = useState( false );

	useEffect( () => {
		// Dispatch exactly once
		if ( ! haveRequestedCachedDetails ) {
			debug( 'requesting cached domain contact details' );
			reduxDispatch( requestContactDetailsCache() );
			setHaveRequestedCachedDetails( true );
		}
	}, [ haveRequestedCachedDetails, reduxDispatch ] );

	const cachedContactDetails = useSelector( getContactDetailsCache );
	if ( cachedContactDetails ) {
		dispatch( 'wpcom' ).loadDomainContactDetailsFromCache( cachedContactDetails );
	}
}
