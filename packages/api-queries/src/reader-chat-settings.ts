import { fetchReaderChatSettings, updateReaderChatSettings } from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import type { ReaderChatSettingsUpdateRequest } from '@automattic/api-core';

export const readerChatSettingsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'reader-chat-settings' ],
		queryFn: () => fetchReaderChatSettings( siteId ),
	} );

export const readerChatSettingsMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( data: ReaderChatSettingsUpdateRequest ) =>
			updateReaderChatSettings( siteId, data ),
		onSuccess: () => {
			queryClient.invalidateQueries( {
				queryKey: readerChatSettingsQuery( siteId ).queryKey,
			} );
		},
	} );
