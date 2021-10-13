import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestReaderListItems } from 'calypso/state/reader/lists/actions';

export default function QueryReaderListItems( { owner, slug } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( requestReaderListItems( owner, slug ) );
	}, [ dispatch, owner, slug ] );

	return null;
}
