import { SubscriptionManager, Reader } from '@automattic/data-stores';
import { rss } from '@wordpress/icons';
import { filterURLForDisplay } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { NonWpcomFeedItem } from 'calypso/reader/helpers/types';
import { getFeedUrl } from 'calypso/reader/route';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import ReaderUnsubscribedFeedItem from './reader-unsubscribed-feed-item';

type ReaderUnsubscribedNonWpcomFeedItemProps = {
	feed: NonWpcomFeedItem;
};

const ReaderUnsubscribedNonWpcomFeedItem = ( {
	feed: { feed_ID: feedId, meta, subscribe_URL: subscribeUrl },
}: ReaderUnsubscribedNonWpcomFeedItemProps ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const subscribe = SubscriptionManager.useSiteSubscribeMutation();
	const filteredDisplayUrl = filterURLForDisplay( subscribeUrl );

	const feedQuery = Reader.useReadFeedQuery( feedId );
	if ( feedQuery.isLoading ) {
		return null;
	}

	const feedUrl =
		meta.links?.feed ||
		feedQuery.data?.feed_URL ||
		feedQuery.data?.meta.links.self ||
		( Reader.isValidId( feedId ) && getFeedUrl( feedId ) );

	return (
		<ReaderUnsubscribedFeedItem
			defaultIcon={ rss }
			description={ feedQuery.data?.description }
			displayUrl={ subscribeUrl }
			feedUrl={ feedUrl || subscribeUrl }
			hasSubscribed={ feedQuery.data?.is_following || subscribe.isSuccess }
			iconUrl={ feedQuery.data?.image }
			isSubscribing={ subscribe.isLoading }
			onSubscribeClick={ () => {
				subscribe.mutate( {
					feed_id: feedId,
					url: subscribeUrl,
					onSuccess: () => {
						dispatch(
							successNotice(
								translate( 'Success! You are now subscribed to %s.', { args: filteredDisplayUrl } ),
								{ duration: 5000 }
							)
						);
					},
					onError: () => {
						dispatch(
							errorNotice( translate( 'Sorry, we had a problem subscribing. Please try again.' ), {
								duration: 5000,
							} )
						);
					},
				} );
			} }
			subscribeDisabled={
				feedQuery.data?.is_following || subscribe.isLoading || subscribe.isSuccess
			}
			title={ feedQuery.data?.name ?? filterURLForDisplay( subscribeUrl ) }
		/>
	);
};

export default ReaderUnsubscribedNonWpcomFeedItem;
