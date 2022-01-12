import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestGuidedTransferStatus } from 'calypso/state/sites/guided-transfer/actions';
import { isRequestingGuidedTransferStatus } from 'calypso/state/sites/guided-transfer/selectors';

const request = ( siteId ) => ( dispatch, getState ) => {
	if ( ! isRequestingGuidedTransferStatus( getState(), siteId ) ) {
		dispatch( requestGuidedTransferStatus( siteId ) );
	}
};

function QuerySiteGuidedTransfer( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		if ( siteId ) {
			dispatch( request( siteId ) );
		}
	}, [ dispatch, siteId ] );

	return null;
}

QuerySiteGuidedTransfer.propTypes = {
	siteId: PropTypes.number,
};

export default QuerySiteGuidedTransfer;
