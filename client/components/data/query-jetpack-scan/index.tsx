/**
 * External dependencies
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import isRequestingJetpackScan from 'state/selectors/is-requesting-jetpack-scan';
import { requestJetpackScanStatus } from 'state/jetpack-scan/actions';

interface Props {
	siteId: number;
}

const QueryJetpackScan = ( { siteId }: Props ) => {
	const requestingJetpackScan = useSelector( state => isRequestingJetpackScan( state, siteId ) );
	const dispatch = useDispatch();

	React.useEffect( () => {
		if ( requestingJetpackScan ) {
			return;
		}
		siteId && dispatch( requestJetpackScanStatus( siteId ) );
	}, [ siteId ] );

	return null;
};

export default QueryJetpackScan;
