import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestTeams } from 'calypso/state/teams/actions';

export function useQueryReaderTeams() {
	const dispatch = useDispatch();
	useEffect( () => {
		dispatch( requestTeams() );
	}, [ dispatch ] );
}

export default function QueryReaderTeams() {
	useQueryReaderTeams();
	return null;
}
