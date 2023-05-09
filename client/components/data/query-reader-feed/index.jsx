import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestFeed } from 'calypso/state/reader/feeds/actions';
import { shouldFeedBeFetched } from 'calypso/state/reader/feeds/selectors';

function QueryReaderFeed( { feedId } ) {
	const dispatch = useDispatch();
	const shouldFetch = useSelector( ( state ) => shouldFeedBeFetched( state, feedId ) );

	useEffect( () => {
		if ( feedId && shouldFetch ) {
			dispatch( requestFeed( feedId ) );
		}
	}, [ dispatch, feedId, shouldFetch ] );

	return null;
}

QueryReaderFeed.propTypes = {
	feedId: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ),
};

export default QueryReaderFeed;
