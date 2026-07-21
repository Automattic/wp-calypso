import { useMastodonNotificationsInfiniteQuery } from '@automattic/api-queries';
import { useCallback } from 'react';
import { SocialNotificationsPanel } from 'calypso/reader/social';
import { getThreadUrl } from './route';
import type { MastodonConnection } from '@automattic/api-core';
import type { NotificationInAppUrlResolver } from 'calypso/reader/social';

// The wpcom backend emits Mastodon notification target URIs as
// `mastodon:<instance>:<status_id>` (see NotificationsNormalizerTest). The
// status id is the home-instance local id, which is exactly what the
// in-app thread route expects.
const MASTODON_TARGET_URI_RE = /^mastodon:[^:]+:([0-9]{1,32})$/;

interface Props {
	connection: MastodonConnection;
}

export function NotificationsPanel( { connection }: Props ) {
	const connectionId = connection.id;
	const getInAppUrl = useCallback< NotificationInAppUrlResolver >(
		( notification ) => {
			const target = notification.target;
			if ( ! target || target.kind !== 'post' ) {
				return null;
			}
			const matched = target.uri.match( MASTODON_TARGET_URI_RE );
			if ( ! matched ) {
				return null;
			}
			return getThreadUrl( connectionId, matched[ 1 ] );
		},
		[ connectionId ]
	);

	return (
		<SocialNotificationsPanel
			connectionId={ connectionId }
			source="mastodon"
			useNotificationsInfiniteQuery={ useMastodonNotificationsInfiniteQuery }
			getInAppUrl={ getInAppUrl }
		/>
	);
}
