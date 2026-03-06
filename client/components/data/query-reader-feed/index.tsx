import { readFeedQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
	receiveReaderFeedRequestFailure,
	receiveReaderFeedRequestSuccess,
} from 'calypso/state/reader/feeds/actions';

interface Props {
	feedId: number;
}

export const QueryReaderFeed = ( { feedId }: Props ) => {
	const { data: feed, isSuccess, isError, error } = useQuery( readFeedQuery( feedId ) );
	const dispatch = useDispatch();

	useEffect( () => {
		if ( isSuccess ) {
			dispatch( receiveReaderFeedRequestSuccess( feed ) );
		}
	}, [ dispatch, feed, isSuccess ] );

	useEffect( () => {
		if ( isError ) {
			dispatch( receiveReaderFeedRequestFailure( feedId, error ) );
		}
	}, [ dispatch, feedId, isError, error ] );

	return null;
};
