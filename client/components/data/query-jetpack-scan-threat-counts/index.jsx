/**
 * External dependencies
 */
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestThreatCounts } from 'calypso/state/jetpack-scan/threat-counts/actions';
import isRequestingJetpackScanThreatCounts from 'calypso/state/selectors/is-requesting-jetpack-scan-threat-counts';

const QueryJetpackScanThreatCounts = ( { siteId } ) => {
	const dispatch = useDispatch();
	const [ requested, setRequested ] = useState(
		useSelector( ( state ) => isRequestingJetpackScanThreatCounts( state, siteId ) )
	);

	useEffect( () => {
		// Don't request if we're missing a siteId,
		// or if a request is already in progress
		if ( ! siteId || requested ) {
			return;
		}

		dispatch( requestThreatCounts( siteId ) );
		setRequested( true );
	}, [ siteId, requested, dispatch, setRequested ] );

	return null;
};

export default QueryJetpackScanThreatCounts;
