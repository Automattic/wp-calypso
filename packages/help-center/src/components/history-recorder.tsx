import { useDispatch } from '@wordpress/data';
import { useHistory } from 'react-router-dom';
import { HELP_CENTER_STORE } from '../stores';

export function HistoryRecorder() {
	const history = useHistory();
	const { setRouterState } = useDispatch( HELP_CENTER_STORE );
	setRouterState( history.entries, history.index );

	return null;
}
