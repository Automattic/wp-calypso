import './style.scss';

import { Button, Spinner, __experimentalVStack as VStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { SocialNotificationItem } from './notification-item';
import type { AtmosphereNotification } from '@automattic/api-core';

interface Props {
	items: AtmosphereNotification[];
	isLoading: boolean;
	isLoadingMore?: boolean;
	isError: boolean;
	hasMore: boolean;
	onLoadMore: () => void;
}

export function SocialNotificationsList( {
	items,
	isLoading,
	isLoadingMore = false,
	isError,
	hasMore,
	onLoadMore,
}: Props ) {
	const translate = useTranslate();

	if ( isLoading && items.length === 0 ) {
		return (
			<div className="social-notifications-list__status" role="status" aria-live="polite">
				<Spinner />
				<span className="screen-reader-text">
					{ translate( 'Loading notifications' ) as string }
				</span>
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
	// `isError && items.length > 0` means an earlier page succeeded but the
	// most recent fetchNextPage failed. Surface a retry affordance instead
	// of silently degrading to the last successful page.
	const showRetry = isError && hasMore && ! isLoadingMore;
	return (
		<VStack spacing={ 0 } className="social-notifications-list">
			{ items.map( ( item ) => (
				<SocialNotificationItem key={ item.id } notification={ item } />
			) ) }
			{ showRetry && (
				<div className="social-notifications-list__footer" role="alert">
					<p className="social-notifications-list__error">
						{ translate( 'We couldn’t load more notifications.' ) as string }
					</p>
					<Button variant="secondary" onClick={ onLoadMore }>
						{ translate( 'Try again' ) as string }
					</Button>
				</div>
			) }
			{ hasMore && ! isError && (
				<div className="social-notifications-list__footer">
					<Button
						variant="secondary"
						onClick={ onLoadMore }
						disabled={ isLoadingMore }
						isBusy={ isLoadingMore }
					>
						{ translate( 'Load more' ) as string }
					</Button>
				</div>
			) }
		</VStack>
	);
}
