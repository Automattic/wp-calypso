import { useMastodonNotificationsInfiniteQuery } from '@automattic/api-queries';
import { useMemo } from 'react';
import { SocialNotificationsList } from 'calypso/reader/social';
import type { MastodonConnection } from '@automattic/api-core';

interface Props {
	connection: MastodonConnection;
}

export function NotificationsPanel( { connection }: Props ) {
	const { data, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useMastodonNotificationsInfiniteQuery( connection.id );

	const items = useMemo( () => data?.pages.flatMap( ( p ) => p.items ) ?? [], [ data ] );

	return (
		<SocialNotificationsList
			items={ items }
			isLoading={ isPending }
			isLoadingMore={ isFetchingNextPage }
			isError={ isError }
			hasMore={ !! hasNextPage }
			onLoadMore={ () => {
				fetchNextPage();
			} }
		/>
	);
}
