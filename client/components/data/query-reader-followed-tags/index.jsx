import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { requestTags } from 'calypso/state/reader/tags/items/actions';

/**
 *  QueryReaderFollowedTags takes no parameters and will add all of a
 *  users tags to the state tree.
 */
const QueryReaderFollowedTags = () => {
	const locale = useSelector( getCurrentUserLocale );
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( requestTags( null, locale ) );
	}, [ dispatch, locale ] );
	return null;
};

export default QueryReaderFollowedTags;
