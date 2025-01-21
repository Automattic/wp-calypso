import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestCurrentUserSubscribedLists } from 'calypso/state/reader/lists/actions';

export default function QueryReaderLists() {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( requestCurrentUserSubscribedLists() );
	}, [ dispatch ] );

	return null;
}
