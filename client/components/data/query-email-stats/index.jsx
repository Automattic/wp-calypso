import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestSitePost } from 'calypso/state/posts/actions';
import {
	requestEmailPeriodStats,
	requestEmailAlltimeStats,
} from 'calypso/state/stats/emails/actions';

const requestPeriodStats = ( siteId, postId, period, date, statType, quantity ) => ( dispatch ) => {
	dispatch( requestEmailPeriodStats( siteId, postId, period, statType, date, quantity ) );
};

const requestAlltimeStats = ( siteId, postId, statType, quantity ) => ( dispatch ) => {
	dispatch( requestEmailAlltimeStats( siteId, postId, statType, quantity ) );
};

function QueryEmailStats( { siteId, postId, period, date, quantity, hasValidDate, statType } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( requestSitePost( siteId, postId ) );
	}, [ dispatch, siteId, postId ] );

	useEffect( () => {
		if ( siteId && postId > -1 ) {
			dispatch( requestAlltimeStats( siteId, postId, statType ) );
		}
	}, [ dispatch, siteId, postId, statType ] );

	useEffect( () => {
		// if hasValidatedDate is false, the date was not set we don't have a post publish date yet
		if ( siteId && postId > -1 && hasValidDate ) {
			dispatch( requestPeriodStats( siteId, postId, period, date, statType, quantity ) );
		}
	}, [ dispatch, siteId, postId, hasValidDate, period, date, statType, quantity ] );

	return null;
}

QueryEmailStats.propTypes = {
	siteId: PropTypes.number,
	postId: PropTypes.number,
	period: PropTypes.string,
	statType: PropTypes.string,
	date: PropTypes.string,
	quantity: PropTypes.number,
	hasValidDate: PropTypes.bool,
	isRequesting: PropTypes.bool,
};

export default QueryEmailStats;
