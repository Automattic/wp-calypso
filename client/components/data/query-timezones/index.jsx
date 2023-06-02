import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestTimezones } from 'calypso/state/timezones/actions';

function QueryTimezones() {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( requestTimezones() );
	}, [ dispatch ] );

	return null;
}

export default QueryTimezones;
