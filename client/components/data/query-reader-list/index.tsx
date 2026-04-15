import { readListQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { receiveReaderList } from 'calypso/state/reader/lists/actions';

export default function QueryReaderList( { owner, slug }: { owner: string; slug: string } ) {
	const dispatch = useDispatch();
	const { data } = useQuery( readListQuery( owner, slug ) );

	useEffect( () => {
		if ( data?.list ) {
			dispatch( receiveReaderList( { list: data.list } ) );
		}
	}, [ data, dispatch ] );

	return null;
}
