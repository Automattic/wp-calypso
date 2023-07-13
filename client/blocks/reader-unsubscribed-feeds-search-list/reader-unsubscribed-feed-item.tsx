import { Button } from '@automattic/components';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { filterURLForDisplay } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { SiteIcon } from 'calypso/blocks/site-icon';
import ExternalLink from 'calypso/components/external-link';

type ReaderUnsubscribedFeedItemProps = {
	defaultIcon?: JSX.Element | null;
	description?: string;
	displayUrl: string;
	feedUrl: string;
	hasSubscribed?: boolean;
	iconUrl?: string;
	isSubscribing?: boolean;
	onDisplayUrlClick?: () => void;
	onSubscribeClick?: () => void;
	onTitleClick?: () => void;
	subscribeDisabled?: boolean;
	title?: string;
};

const ReaderUnsubscribedFeedItem = ( {
	defaultIcon,
	description = '',
	displayUrl,
	feedUrl,
	iconUrl,
	isSubscribing = false,
	onDisplayUrlClick,
	onSubscribeClick,
	onTitleClick,
	subscribeDisabled = false,
	hasSubscribed = false,
	title,
}: ReaderUnsubscribedFeedItemProps ) => {
	const translate = useTranslate();
	const filteredDisplayUrl = filterURLForDisplay( displayUrl );
	return (
		<HStack as="li" className="reader-unsubscribed-feed-item" alignItems="center" spacing={ 8 }>
			<HStack className="reader-unsubscribed-feed-item__site-preview-h-stack" spacing={ 3 }>
				<SiteIcon iconUrl={ iconUrl } defaultIcon={ defaultIcon } size={ 40 } />
				<VStack className="reader-unsubscribed-feed-item__title-with-url-v-stack" spacing={ 0 }>
					<a
						className="reader-unsubscribed-feed-item__title"
						href={ feedUrl }
						onClick={ onTitleClick } // TODO: track click
					>
						{ title ? title : filteredDisplayUrl }
					</a>
					<ExternalLink
						className="reader-unsubscribed-feed-item__url"
						href={ displayUrl }
						rel="noreferrer noopener"
						target="_blank"
						onClick={ onDisplayUrlClick } // TODO: track click
					>
						{ filteredDisplayUrl }
					</ExternalLink>
				</VStack>
			</HStack>
			<div className="reader-unsubscribed-feed-item__description">{ description }</div>
			<div>
				{ /* TODO: track click */ }
				<Button
					primary
					disabled={ subscribeDisabled }
					busy={ isSubscribing }
					onClick={ onSubscribeClick }
				>
					{ hasSubscribed
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
