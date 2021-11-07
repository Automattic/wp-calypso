import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestScanStatus } from 'calypso/state/jetpack-scan/actions';
import isRequestingJetpackScan from 'calypso/state/selectors/is-requesting-jetpack-scan';

interface Props {
	siteId: number;
}

const QueryJetpackScan = ( { siteId }: Props ) => {
	const requestingJetpackScan = useSelector( ( state ) =>
		isRequestingJetpackScan( state, siteId )
	);
	const dispatch = useDispatch();

	useEffect( () => {
		if ( requestingJetpackScan ) {
			return;
		}
		siteId && dispatch( requestScanStatus( siteId ) );
	}, [ siteId ] );

	return null;
};

export default QueryJetpackScan;
