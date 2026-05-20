import { useAtmosphereNotificationsInfiniteQuery } from '@automattic/api-queries';
import { SocialNotificationsPanel } from 'calypso/reader/social';
import type { AtmosphereConnection } from '@automattic/api-core';

interface Props {
	connection: AtmosphereConnection;
}

export function NotificationsPanel( { connection }: Props ) {
	return (
		<SocialNotificationsPanel
			connectionId={ connection.id }
			source="atmosphere"
			useNotificationsInfiniteQuery={ useAtmosphereNotificationsInfiniteQuery }
		/>
	);
}
