import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestEligibility } from 'calypso/state/automated-transfer/actions';

function QueryAutomatedTransferEligibility( { siteId } ) {
	const dispatch = useDispatch();
	useEffect( () => {
		siteId && dispatch( requestEligibility( siteId ) );
	}, [ siteId, dispatch ] );

	return null;
}

QueryAutomatedTransferEligibility.propTypes = {
	siteId: PropTypes.number,
};

export default QueryAutomatedTransferEligibility;
