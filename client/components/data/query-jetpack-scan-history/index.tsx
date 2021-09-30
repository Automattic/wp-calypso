import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestJetpackScanHistory } from 'calypso/state/jetpack-scan/history/actions';
import isRequestingJetpackScanHistory from 'calypso/state/selectors/is-requesting-jetpack-scan-history';

interface Props {
	siteId: number;
}

const QueryJetpackScanHistory = ( { siteId }: Props ) => {
	const requestingJetpackScanHistory = useSelector( ( state ) =>
		isRequestingJetpackScanHistory( state, siteId )
	);
	const dispatch = useDispatch();

	useEffect( () => {
		if ( requestingJetpackScanHistory ) {
			return;
		}
		siteId && dispatch( requestJetpackScanHistory( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
};

export default QueryJetpackScanHistory;
