import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
	requestFeedSearch,
	SORT_BY_LAST_UPDATED,
	SORT_BY_RELEVANCE,
} from 'calypso/state/reader/feed-searches/actions';

function QueryFeedSearch( { query, excludeFollowed, sort } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( requestFeedSearch( { query, excludeFollowed, sort } ) );
	}, [ dispatch, query, excludeFollowed, sort ] );

	return null;
}

QueryFeedSearch.propTypes = {
	query: PropTypes.string,
	excludeFollowed: PropTypes.bool,
	sort: PropTypes.oneOf( [ SORT_BY_LAST_UPDATED, SORT_BY_RELEVANCE ] ),
};

export default QueryFeedSearch;
