import { useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { HELP_CENTER_STORE } from '../stores';

export function HistoryRecorder() {
	const { entries, index } = useHistory();
	const { setRouterState } = useDispatch( HELP_CENTER_STORE );

	useEffect( () => {
		setRouterState( entries, index );
	}, [ entries, index, setRouterState ] );

	return null;
}
