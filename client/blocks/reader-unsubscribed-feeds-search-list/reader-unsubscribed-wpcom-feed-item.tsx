import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { getFeedUrl, getSiteName, getSiteUrl } from 'calypso/reader/get-helpers';
import { WpcomFeedItem } from 'calypso/reader/helpers/types';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import ReaderUnsubscribedFeedItem from './reader-unsubscribed-feed-item';

type ReaderUnsubscribedWpcomFeedItemProps = {
	feed: WpcomFeedItem;
};

const ReaderUnsubscribedWpcomFeedItem = ( { feed }: ReaderUnsubscribedWpcomFeedItemProps ) => {
	const {
		mutate: subscribe,
		isLoading: subscribing,
		isSuccess: subscribed,
	} = SubscriptionManager.useSiteSubscribeMutation();
	const dispatch = useDispatch();
	const translate = useTranslate();

	const { data: site, isLoading } = Reader.useReadFeedSiteQuery( Number( feed.blog_ID ) );
	if ( isLoading ) {
		return null; // TODO: render a placeholder
	}

	const siteName = getSiteName( { feed, site } );

	return (
		<ReaderUnsubscribedFeedItem
			description={ site?.description }
			displayUrl={ getSiteUrl( { feed, site } ) }
			feedUrl={ getFeedUrl( { feed, site } ) }
			iconUrl={ site?.icon?.img ?? site?.icon?.ico }
			isSubscribing={ subscribing }
			onDisplayUrlClick={ () => undefined } // TODO: track click
			onSubscribeClick={ () => {
				subscribe( {
					blog_id: feed.blog_ID,
					url: feed.subscribe_URL,
					onSuccess: () => {
						dispatch(
							successNotice(
								translate( 'Success! You are now subscribed to %s.', { args: siteName } ),
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
				// TODO: track click
			} }
			onTitleClick={ () => undefined } // TODO: track click
			subscribeDisabled={ site?.is_following || subscribing || subscribed }
			hasSubscribed={ site?.is_following || subscribed }
			title={ siteName }
		/>
	);
};

export default ReaderUnsubscribedWpcomFeedItem;
