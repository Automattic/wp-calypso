import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestSubscribedLists } from 'calypso/state/reader/lists/actions';

export default function QueryReaderLists() {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( requestSubscribedLists() );
	}, [ dispatch ] );

	return null;
}
