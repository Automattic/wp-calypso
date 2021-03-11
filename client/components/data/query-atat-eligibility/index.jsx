/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestEligibility } from 'calypso/state/automated-transfer/actions';

export default function QueryAutomatedTransferEligibility( siteId ) {
	const dispatch = useDispatch();
	React.useEffect( () => {
		siteId && dispatch( requestEligibility( siteId ) );
	}, [ siteId, dispatch ] );

	return null;
}
