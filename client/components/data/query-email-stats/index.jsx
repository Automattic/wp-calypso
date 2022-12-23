import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestEmailStats } from 'calypso/state/stats/emails/actions';

const request = ( siteId, postId, period, date, quantity ) => ( dispatch ) => {
	dispatch( requestEmailStats( siteId, postId, period, date, quantity ) );
};

function QueryEmailStats( { siteId, postId, period, date, quantity } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		if ( siteId && postId > -1 ) {
			dispatch( request( siteId, postId, period, date, quantity ) );
		}
	}, [ dispatch, siteId, postId ] );

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
