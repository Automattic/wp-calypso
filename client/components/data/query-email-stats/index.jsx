import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestEmailStats } from 'calypso/state/stats/emails/actions';

const request = ( siteId, postId, period, date, statType, quantity ) => ( dispatch ) => {
	dispatch( requestEmailStats( siteId, postId, period, date, statType, quantity ) );
};

function QueryEmailStats( { siteId, postId, period, date, quantity } ) {
	const dispatch = useDispatch();
	const statType = 'opens';

	useEffect( () => {
		if ( siteId && postId > -1 ) {
			dispatch( request( siteId, postId, period, date, statType, quantity ) );
		}
	}, [ dispatch, siteId, postId, period ] );

	return null;
}

QueryEmailStats.propTypes = {
	siteId: PropTypes.number,
	postId: PropTypes.number,
	period: PropTypes.string,
	date: PropTypes.string,
	quantity: PropTypes.number,
};

export default QueryEmailStats;
