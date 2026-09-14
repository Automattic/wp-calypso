import { useFediverseNotificationsInfiniteQuery } from '@automattic/api-queries';
import { SocialNotificationsPanel } from 'calypso/reader/social';
import type { FediverseConnection } from '@automattic/api-core';

interface Props {
	connection: FediverseConnection;
}

export function NotificationsPanel( { connection }: Props ) {
	return (
		<SocialNotificationsPanel
			connectionId={ connection.id }
			source="fediverse"
			useNotificationsInfiniteQuery={ useFediverseNotificationsInfiniteQuery }
		/>
	);
}
