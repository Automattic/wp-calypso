/**
 * External dependencies
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import isRequestingJetpackScan from 'calypso/state/selectors/is-requesting-jetpack-scan';
import { requestScanStatus } from 'calypso/state/jetpack-scan/actions';

interface Props {
	siteId: number;
}

const QueryJetpackScan = ( { siteId }: Props ) => {
	const requestingJetpackScan = useSelector( ( state ) =>
		isRequestingJetpackScan( state, siteId )
	);
	const dispatch = useDispatch();

	React.useEffect( () => {
		if ( requestingJetpackScan ) {
			return;
		}
		siteId && dispatch( requestScanStatus( siteId ) );
	}, [ siteId ] );

	return null;
};

export default QueryJetpackScan;
