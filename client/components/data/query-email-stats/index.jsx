import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestSitePost } from 'calypso/state/posts/actions';
import {
	requestEmailPeriodStats,
	requestEmailAlltimeStats,
} from 'calypso/state/stats/emails/actions';

const requestPeriodStats = ( siteId, postId, period, date, statType, quantity ) => ( dispatch ) => {
	dispatch( requestEmailPeriodStats( siteId, postId, period, date, statType, quantity ) );
};

const requestAlltimeStats = ( siteId, postId, statType, quantity ) => ( dispatch ) => {
	dispatch( requestEmailAlltimeStats( siteId, postId, statType, quantity ) );
};

function QueryEmailStats( { siteId, postId, period, date, quantity } ) {
	const dispatch = useDispatch();
	const statType = 'opens';

	useEffect( () => {
		dispatch( requestSitePost( siteId, postId ) );
	}, [ dispatch, siteId, postId ] );

	useEffect( () => {
		if ( siteId && postId > -1 ) {
			dispatch( requestAlltimeStats( siteId, postId, statType ) );
		}
	}, [ dispatch, siteId, postId, statType ] );

	useEffect( () => {
		if ( siteId && postId > -1 ) {
			dispatch( requestPeriodStats( siteId, postId, period, date, statType, quantity ) );
		}
	}, [ dispatch, siteId, postId, period, date, statType, quantity ] );

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
