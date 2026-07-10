import {
	markAllReaderPostsAsSeen,
	markReaderPostsAsSeen,
	markReaderPostsAsUnseen,
	markReaderWpcomPostsAsSeen,
	markReaderWpcomPostsAsUnseen,
	type ReadSeenPostsAllParams,
	type ReadSeenPostsBlogParams,
	type ReadSeenPostsFeedParams,
	type ReadSeenPostsResponse,
} from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';

export const markReaderPostsAsSeenMutation = () =>
	mutationOptions< ReadSeenPostsResponse, Error, ReadSeenPostsFeedParams >( {
		mutationFn: markReaderPostsAsSeen,
	} );

export const markReaderPostsAsUnseenMutation = () =>
	mutationOptions< ReadSeenPostsResponse, Error, ReadSeenPostsFeedParams >( {
		mutationFn: markReaderPostsAsUnseen,
	} );

export const markReaderWpcomPostsAsSeenMutation = () =>
	mutationOptions< ReadSeenPostsResponse, Error, ReadSeenPostsBlogParams >( {
		mutationFn: markReaderWpcomPostsAsSeen,
	} );

export const markReaderWpcomPostsAsUnseenMutation = () =>
	mutationOptions< ReadSeenPostsResponse, Error, ReadSeenPostsBlogParams >( {
		mutationFn: markReaderWpcomPostsAsUnseen,
	} );

export const markAllReaderPostsAsSeenMutation = () =>
	mutationOptions< ReadSeenPostsResponse, Error, ReadSeenPostsAllParams >( {
		mutationFn: markAllReaderPostsAsSeen,
	} );
