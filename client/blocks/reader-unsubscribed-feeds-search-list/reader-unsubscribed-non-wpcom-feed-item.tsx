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
	feed: { subscribe_URL: subscribeUrl, feed_ID: feedId },
}: ReaderUnsubscribedNonWpcomFeedItemProps ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const {
		mutate: subscribe,
		isLoading: subscribing,
		isSuccess: subscribed,
	} = SubscriptionManager.useSiteSubscribeMutation();
	const filteredDisplayUrl = filterURLForDisplay( subscribeUrl );
	const feedUrl = Reader.isValidId( feedId ) ? getFeedUrl( feedId ) : subscribeUrl;

	return (
		<ReaderUnsubscribedFeedItem
			defaultIcon={ rss }
			displayUrl={ subscribeUrl }
			feedUrl={ feedUrl }
			isSubscribing={ subscribing }
			title={ filterURLForDisplay( subscribeUrl ) }
			onSubscribeClick={ () => {
				subscribe( {
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
			hasSubscribed={ subscribed }
		/>
	);
};

export default ReaderUnsubscribedNonWpcomFeedItem;
