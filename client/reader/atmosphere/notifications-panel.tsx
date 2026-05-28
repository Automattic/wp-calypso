import { useAtmosphereNotificationsInfiniteQuery } from '@automattic/api-queries';
import { useCallback } from 'react';
import { SocialNotificationsPanel } from 'calypso/reader/social';
import { getThreadUrl } from './route';
import type { AtmosphereConnection } from '@automattic/api-core';
import type { NotificationInAppUrlResolver } from 'calypso/reader/social';

interface Props {
	connection: AtmosphereConnection;
}

export function NotificationsPanel( { connection }: Props ) {
	const connectionId = connection.id;
	// Mention / reply / quote / like / repost notifications all carry an at://
	// post URI on the target. Route the row to the in-app thread view instead
	// of letting it bounce the user out to bsky.app via target_url.
	const getInAppUrl = useCallback< NotificationInAppUrlResolver >(
		( notification ) => {
			const target = notification.target;
			if ( ! target || target.kind !== 'post' ) {
				return null;
			}
			return getThreadUrl( connectionId, target.uri );
		},
		[ connectionId ]
	);

	return (
		<SocialNotificationsPanel
			connectionId={ connectionId }
			source="atmosphere"
			useNotificationsInfiniteQuery={ useAtmosphereNotificationsInfiniteQuery }
			getInAppUrl={ getInAppUrl }
		/>
	);
}
