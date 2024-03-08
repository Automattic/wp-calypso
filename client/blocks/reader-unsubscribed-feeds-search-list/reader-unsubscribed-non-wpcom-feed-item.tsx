import { recordTrainTracksRender, recordTrainTracksInteract } from '@automattic/calypso-analytics';
import { SubscriptionManager, Reader } from '@automattic/data-stores';
import { rss } from '@wordpress/icons';
import { filterURLForDisplay } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import {
	useRecordSiteIconClicked,
	useRecordSiteTitleClicked,
	useRecordSiteUrlClicked,
	useRecordSearchSiteSubscribed,
	SOURCE_SUBSCRIPTIONS_SEARCH_RECOMMENDATION_LIST,
} from 'calypso/landing/subscriptions/tracks';
import { NonWpcomFeedItem } from 'calypso/reader/helpers/types';
import { getFeedUrl } from 'calypso/reader/route';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import ReaderUnsubscribedFeedItem from './reader-unsubscribed-feed-item';

type ReaderUnsubscribedNonWpcomFeedItemProps = {
	feed: NonWpcomFeedItem;
	uiPosition?: number;
};

const ReaderUnsubscribedNonWpcomFeedItem = ( {
	feed: { feed_ID: feedId, meta, subscribe_URL: subscribeUrl, railcar },
	uiPosition,
}: ReaderUnsubscribedNonWpcomFeedItemProps ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const subscribe = SubscriptionManager.useSiteSubscribeMutation();
	const filteredDisplayUrl = filterURLForDisplay( subscribeUrl );

	const feedQuery = Reader.useReadFeedQuery( feedId );
	const feedUrl =
		meta.links?.feed ||
		feedQuery.data?.feed_URL ||
		feedQuery.data?.meta.links.self ||
		( Reader.isValidId( feedId ) && getFeedUrl( feedId ) );

	const recordSiteIconClicked = useRecordSiteIconClicked();
	const recordSiteTitleClicked = useRecordSiteTitleClicked();
	const recordSiteUrlClicked = useRecordSiteUrlClicked();
	const recordSearchSiteSubscribed = useRecordSearchSiteSubscribed();

	const feed_id = feedId;
	const url = feedUrl || subscribeUrl;
	const source = SOURCE_SUBSCRIPTIONS_SEARCH_RECOMMENDATION_LIST;

	useEffect( () => {
		if ( railcar ) {
			// reader: railcar, ui_algo: following_manage, ui_position, fetch_algo, fetch_position, rec_blog_id (incorrect: fetch_lang, action)
			// subscriptions: railcar, ui_algo: reader-subscriptions-search, ui_position, fetch_algo, fetch_position, rec_blog_id
			recordTrainTracksRender( {
				railcarId: railcar.railcar,
				uiAlgo: 'reader-subscriptions-search',
				uiPosition: uiPosition ?? -1,
				fetchAlgo: railcar.fetch_algo,
				fetchPosition: railcar.fetch_position,
				recBlogId: railcar.rec_blog_id,
			} );
		}
	}, [ railcar, uiPosition ] );

	if ( feedQuery.isLoading ) {
		return null;
	}

	return (
		<ReaderUnsubscribedFeedItem
			defaultIcon={ rss }
			description={ feedQuery.data?.description }
			displayUrl={ subscribeUrl }
			feedUrl={ subscribeUrl }
			isExternalLink
			hasSubscribed={ feedQuery.data?.is_following || subscribe.isSuccess }
			iconUrl={ feedQuery.data?.image }
			isSubscribing={ subscribe.isPending }
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

				recordSearchSiteSubscribed( { blog_id: null, url, source } );
				if ( railcar ) {
					// reader: action: site_followed, railcar, ui_algo, ui_position, fetch_algo, fetch_position, fetch_lang, rec_blog_id, (incorrect: only railcar & action accepted)
					// subscriptions: action: recommended_search_item_site_subscribed, railcar
					recordTrainTracksInteract( {
						railcarId: railcar.railcar,
						action: 'recommended_search_item_site_subscribed',
					} );
				}
			} }
			subscribeDisabled={
				feedQuery.data?.is_following || subscribe.isPending || subscribe.isSuccess
			}
			title={ feedQuery.data?.name ?? filterURLForDisplay( subscribeUrl ) }
			onTitleClick={ () => {
				recordSiteTitleClicked( { blog_id: null, feed_id, source } );
				if ( railcar ) {
					// reader: action: feed_link_clicked, railcar, ui_algo, ui_position, fetch_algo, fetch_position, fetch_lang, rec_blog_id, (incorrect: only railcar & action accepted)
					// subscriptions: action: recommended_search_item_site_title_click, railcar
					recordTrainTracksInteract( {
						railcarId: railcar.railcar,
						action: 'recommended_search_item_site_title_click',
					} );
				}
			} }
			onIconClick={ () => {
				recordSiteIconClicked( { blog_id: null, feed_id, source } );
				if ( railcar ) {
					// reader: action: avatar_click, railcar, ui_algo, ui_position, fetch_algo, fetch_position, fetch_lang, rec_blog_id, (incorrect: only railcar & action accepted)
					// subscriptions: action: recommended_search_item_site_icon_click, railcar
					recordTrainTracksInteract( {
						railcarId: railcar.railcar,
						action: 'recommended_search_item_site_icon_click',
					} );
				}
			} }
			onDisplayUrlClick={ () => {
				recordSiteUrlClicked( { blog_id: null, feed_id, source } );
				if ( railcar ) {
					// reader: action: site_url_clicked, railcar, ui_algo, ui_position, fetch_algo, fetch_position, fetch_lang, rec_blog_id, (incorrect: only railcar & action accepted)
					// subscriptions: action: recommended_search_item_site_icon_click, railcar
					recordTrainTracksInteract( {
						railcarId: railcar.railcar,
						action: 'recommended_search_item_site_url_click',
					} );
				}
			} }
		/>
	);
};

export default ReaderUnsubscribedNonWpcomFeedItem;
