import { readFeedQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
	receiveReaderFeedRequestFailure,
	receiveReaderFeedRequestSuccess,
} from 'calypso/state/reader/feeds/actions';

interface Props {
	feedId: number | null;
}

/**
 * Component data that fetches a feed using react-query and maintain a bridge with the redux store for retro-compatibility.
 * @deprecated Use readFeedQuery + useQuery instead for now component, data components are being refactored to use hooks instead.
 @ @param props - The props object.
 @ @param props.feedId - The ID of the feed to fetch.
 * @returns {null}
 */
export default function QueryReaderFeed( { feedId }: Props ) {
	const { data: feed, isSuccess, isError, error } = useQuery( readFeedQuery( feedId ) );
	const dispatch = useDispatch();

	useEffect( () => {
		if ( isSuccess ) {
			dispatch( receiveReaderFeedRequestSuccess( feed ) );
		}
	}, [ dispatch, feed, isSuccess ] );

	useEffect( () => {
		if ( isError && feedId ) {
			dispatch( receiveReaderFeedRequestFailure( feedId, error ) );
		}
	}, [ dispatch, feedId, isError, error ] );

	return null;
}
