import { useMastodonNotificationsInfiniteQuery } from '@automattic/api-queries';
import { SocialNotificationsPanel } from 'calypso/reader/social';
import type { MastodonConnection } from '@automattic/api-core';

interface Props {
	connection: MastodonConnection;
}

export function NotificationsPanel( { connection }: Props ) {
	return (
		<SocialNotificationsPanel
			connectionId={ connection.id }
			source="mastodon"
			useNotificationsInfiniteQuery={ useMastodonNotificationsInfiniteQuery }
		/>
	);
}
