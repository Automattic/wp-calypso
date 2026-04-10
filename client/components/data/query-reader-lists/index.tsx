import { readSubscribedListsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { receiveLists } from 'calypso/state/reader/lists/actions';

export default function QueryReaderLists() {
	const dispatch = useDispatch();
	const { data } = useQuery( readSubscribedListsQuery() );

	useEffect( () => {
		if ( data?.lists ) {
			dispatch( receiveLists( data.lists ) );
		}
	}, [ data, dispatch ] );

	return null;
}
