import './style.scss';

import { Button, Spinner, __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { SocialNotificationItem } from './notification-item';
import type { AtmosphereNotification } from '@automattic/api-core';

interface Props {
	items: AtmosphereNotification[];
	seenAt: string | null;
	isLoading: boolean;
	isError: boolean;
	hasMore: boolean;
	onLoadMore: () => void;
}

export function SocialNotificationsList( {
	items,
	isLoading,
	isError,
	hasMore,
	onLoadMore,
}: Props ) {
	const translate = useTranslate();

	if ( isLoading && items.length === 0 ) {
		return (
			<div className="social-notifications-list__status" role="status" aria-live="polite">
				<Spinner />
			</div>
		);
	}
	if ( isError && items.length === 0 ) {
		return (
			<div className="social-notifications-list__status">
				<p>{ translate( 'We couldn’t load notifications. Try again later.' ) as string }</p>
			</div>
		);
	}
	if ( items.length === 0 ) {
		return (
			<div className="social-notifications-list__status">
				<p>{ translate( 'No notifications yet.' ) as string }</p>
			</div>
		);
	}
	return (
		<VStack spacing={ 0 } className="social-notifications-list">
			{ items.map( ( item ) => (
				<SocialNotificationItem key={ item.id } notification={ item } />
			) ) }
			{ hasMore && (
				<div className="social-notifications-list__footer">
					<Button variant="secondary" onClick={ onLoadMore }>
						{ translate( 'Load more' ) as string }
					</Button>
				</div>
			) }
		</VStack>
	);
}
