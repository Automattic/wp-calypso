import { useAtmosphereNotificationsInfiniteQuery } from '@automattic/api-queries';
import { useMemo } from 'react';
import { SocialNotificationsList } from 'calypso/reader/social';
import type { AtmosphereConnection } from '@automattic/api-core';

interface Props {
	connection: AtmosphereConnection;
}

export function NotificationsPanel( { connection }: Props ) {
	const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
		useAtmosphereNotificationsInfiniteQuery( connection.id );

	const items = useMemo( () => data?.pages.flatMap( ( p ) => p.items ) ?? [], [ data ] );

	return (
		<SocialNotificationsList
			items={ items }
			isLoading={ isLoading }
			isLoadingMore={ isFetchingNextPage }
			isError={ isError }
			hasMore={ !! hasNextPage }
			onLoadMore={ () => {
				fetchNextPage();
			} }
		/>
	);
}
