import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestSupportHistory } from 'calypso/state/help/history/actions';

export default function QuerySupportHistory( { email } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( requestSupportHistory( email ) );
	}, [ dispatch, email ] );

	return null;
}
