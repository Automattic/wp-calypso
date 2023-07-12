import { Button } from '@automattic/components';
import { Reader, SubscriptionManager } from '@automattic/data-stores';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { filterURLForDisplay } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { SiteIcon } from 'calypso/blocks/site-icon';
import ExternalLink from 'calypso/components/external-link';
import { getFeedUrl, getSiteName, getSiteUrl } from 'calypso/reader/get-helpers';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

type ReaderUnsubscribedFeedItemProps = {
	feed: Reader.FeedItem;
};

const ReaderUnsubscribedFeedItem = ( { feed }: ReaderUnsubscribedFeedItemProps ) => {
	if ( Number.isNaN( Number( feed.blog_ID ) ) ) {
		throw new Error( 'Feed item blog_ID is NaN' );
	}

	const {
		mutate: subscribe,
		isLoading: subscribing,
		isSuccess: subscribed,
	} = SubscriptionManager.useSiteSubscribeMutation( feed.blog_ID );
	const dispatch = useDispatch();
	const translate = useTranslate();

	const { data: site, isLoading } = Reader.useReadFeedSiteQuery( Number( feed.blog_ID ) );
	if ( isLoading ) {
		return null; // TODO: render a placeholder
	}

	const siteName = getSiteName( { feed, site } );
	const siteUrl = getSiteUrl( { feed, site } );

	return (
		<HStack as="li" className="reader-unsubscribed-feed-item" alignment="center" spacing={ 8 }>
			<HStack className="reader-unsubscribed-feed-item__site-preview-h-stack" spacing={ 3 }>
				<SiteIcon iconUrl={ site?.icon?.img ?? site?.icon?.ico } size={ 40 } />
				<VStack className="reader-unsubscribed-feed-item__title-with-url-v-stack" spacing={ 0 }>
					<a
						className="reader-unsubscribed-feed-item__title"
						href={ getFeedUrl( { feed, site } ) }
						onClick={ () => undefined } // TODO: track click
					>
						{ siteName }
					</a>
					<ExternalLink
						className="reader-unsubscribed-feed-item__url"
						href={ siteUrl }
						rel="noreferrer noopener"
						target="_blank"
						onClick={ () => undefined } // TODO: track click
					>
						{ filterURLForDisplay( siteUrl ) }
					</ExternalLink>
				</VStack>
			</HStack>
			<div className="reader-unsubscribed-feed-item__description">{ site?.description }</div>
			<div>
				<Button
					primary
					disabled={ site?.is_following || subscribing || subscribed }
					busy={ subscribing }
					onClick={ () => {
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
									errorNotice(
										translate( 'Sorry, we had a problem subscribing. Please try again.' ),
										{ duration: 5000 }
									)
								);
							},
						} );
						// TODO: track click
					} }
				>
					{ site?.is_following
						? translate( 'Subscribed', {
								comment:
									'The user just subscribed to the site that the button relates to, and so the button is in disabled state.',
						  } )
						: translate( 'Subscribe', {
								comment:
									'Describes an action to be done on the click of the button, i.e. subscribe to the site that this button relates to.',
						  } ) }
				</Button>
			</div>
		</HStack>
	);
};

export default ReaderUnsubscribedFeedItem;
