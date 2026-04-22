import { wpcom } from '../wpcom-fetcher';
import type { ReaderChatSettings, ReaderChatSettingsUpdateRequest } from './types';

export async function updateReaderChatSettings(
	siteId: number,
	data: ReaderChatSettingsUpdateRequest
): Promise< ReaderChatSettings > {
	return wpcom.req.post(
		{
			path: `/sites/${ siteId }/reader-chat-settings`,
			apiNamespace: 'wpcom/v2',
		},
		data
	);
}
