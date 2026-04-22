import { wpcom } from '../wpcom-fetcher';
import type { ReaderChatSettings } from './types';

export async function fetchReaderChatSettings( siteId: number ): Promise< ReaderChatSettings > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/reader-chat-settings`,
		apiNamespace: 'wpcom/v2',
	} );
}
