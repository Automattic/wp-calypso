import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type {
	ReadConversationsCommentsParams,
	ReadConversationsCommentsResponse,
	ReadConversationsParams,
	ReadConversationsResponse,
} from './types';

export const fetchReadConversationsList = (
	params: ReadConversationsParams = {}
): Promise< ReadConversationsResponse > =>
	wpcom.req.get( {
		path: addQueryArgs( '/read/conversations', { ...params } ),
		apiNamespace: 'wpcom/v2',
		method: 'GET',
	} );

export const fetchReadConversationsComments = (
	params: ReadConversationsCommentsParams = {}
): Promise< ReadConversationsCommentsResponse > =>
	wpcom.req.get( {
		path: addQueryArgs( '/read/conversations/comments', { ...params } ),
		apiNamespace: 'wpcom/v2',
		method: 'GET',
	} );
