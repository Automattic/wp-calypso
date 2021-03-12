/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestEligibility } from 'calypso/state/automated-transfer/actions';

function QueryAutomatedTransferEligibility( { siteId } ) {
	const dispatch = useDispatch();
	React.useEffect( () => {
		siteId && dispatch( requestEligibility( siteId ) );
	}, [ siteId, dispatch ] );

	return null;
}

QueryAutomatedTransferEligibility.propTypes = {
	siteId: PropTypes.number,
};

export default QueryAutomatedTransferEligibility;
