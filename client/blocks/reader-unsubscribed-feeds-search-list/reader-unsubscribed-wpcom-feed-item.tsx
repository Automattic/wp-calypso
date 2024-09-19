import { recordTrainTracksRender, recordTrainTracksInteract } from '@automattic/calypso-analytics';
import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import {
	useRecordSiteIconClicked,
	useRecordSiteTitleClicked,
	useRecordSiteUrlClicked,
	useRecordSearchSiteSubscribed,
	SOURCE_SUBSCRIPTIONS_SEARCH_RECOMMENDATION_LIST,
} from 'calypso/landing/subscriptions/tracks';
import { getSiteName, getSiteUrl } from 'calypso/reader/get-helpers';
import { WpcomFeedItem } from 'calypso/reader/helpers/types';
import { getFeedUrl } from 'calypso/reader/route';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import ReaderUnsubscribedFeedItem from './reader-unsubscribed-feed-item';

type ReaderUnsubscribedWpcomFeedItemProps = {
	feed: WpcomFeedItem;
	uiPosition?: number;
};

const ReaderUnsubscribedWpcomFeedItem = ( {
	feed,
	uiPosition,
}: ReaderUnsubscribedWpcomFeedItemProps ) => {
	const {
		mutate: subscribe,
		isPending: subscribing,
		isSuccess: subscribed,
	} = SubscriptionManager.useSiteSubscribeMutation();
	const dispatch = useDispatch();
	const translate = useTranslate();

	const recordSiteIconClicked = useRecordSiteIconClicked();
	const recordSiteTitleClicked = useRecordSiteTitleClicked();
	const recordSiteUrlClicked = useRecordSiteUrlClicked();
	const recordSearchSiteSubscribed = useRecordSearchSiteSubscribed();

	const blog_id = feed.blog_ID;
	const feed_id = feed.feed_ID;
	const url = feed.subscribe_URL;
	const source = SOURCE_SUBSCRIPTIONS_SEARCH_RECOMMENDATION_LIST;
	const railcar = feed.railcar;

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

	const { data: site, isLoading } = Reader.useReadFeedSiteQuery( Number( feed.blog_ID ) );
	if ( isLoading ) {
		return null; // TODO: render a placeholder
	}

	const siteName = getSiteName( { feed, site } );

	return (
		<ReaderUnsubscribedFeedItem
			description={ site?.description }
			displayUrl={ getSiteUrl( { feed, site } ) }
			feedUrl={ getFeedUrl( feed_id ) }
			iconUrl={ site?.icon?.img ?? site?.icon?.ico }
			isSubscribing={ subscribing }
			onSubscribeClick={ () => {
				subscribe( {
					blog_id,
					feed_id,
					url,
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

				recordSearchSiteSubscribed( { blog_id, url, source } );
				if ( railcar ) {
					// reader: action: site_followed, railcar, ui_algo, ui_position, fetch_algo, fetch_position, fetch_lang, rec_blog_id, (incorrect: only railcar & action accepted)
					// subscriptions: action: recommended_search_item_site_subscribed, railcar
					recordTrainTracksInteract( {
						railcarId: railcar.railcar,
						action: 'recommended_search_item_site_subscribed',
					} );
				}
			} }
			onTitleClick={ () => {
				recordSiteTitleClicked( { blog_id, feed_id, source } );
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
				recordSiteIconClicked( { blog_id, feed_id, source } );
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
				recordSiteUrlClicked( { blog_id, feed_id, source } );
				if ( railcar ) {
					// reader: action: site_url_clicked, railcar, ui_algo, ui_position, fetch_algo, fetch_position, fetch_lang, rec_blog_id, (incorrect: only railcar & action accepted)
					// subscriptions: action: recommended_search_item_site_icon_click, railcar
					recordTrainTracksInteract( {
						railcarId: railcar.railcar,
						action: 'recommended_search_item_site_url_click',
					} );
				}
			} }
			subscribeDisabled={ site?.is_following || subscribing || subscribed }
			hasSubscribed={ site?.is_following || subscribed }
			title={ siteName }
		/>
	);
};

export default ReaderUnsubscribedWpcomFeedItem;
