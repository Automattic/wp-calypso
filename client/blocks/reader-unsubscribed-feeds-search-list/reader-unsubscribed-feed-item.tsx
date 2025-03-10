import { Button, ExternalLink } from '@automattic/components';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { filterURLForDisplay } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import { SiteIcon } from 'calypso/blocks/site-icon';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { errorNotice } from 'calypso/state/notices/actions';

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
	onIconClick?: () => void;
	subscribeDisabled?: boolean;
	title?: string;
	isExternalLink?: boolean;
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
	onIconClick,
	hasSubscribed = false,
	subscribeDisabled = false,
	isExternalLink = false,
	title,
}: ReaderUnsubscribedFeedItemProps ) => {
	const translate = useTranslate();
	const isEmailVerified = useSelector( isCurrentUserEmailVerified );
	const dispatch = useDispatch();
	const filteredDisplayUrl = filterURLForDisplay( displayUrl );

	const onSubscribeClickEvent = ! isEmailVerified
		? () => {
				dispatch(
					errorNotice( translate( 'Please verify your email before subscribing.' ), {
						id: 'resend-verification-email',
						button: translate( 'Account Settings' ),
						href: '/me/account',
					} )
				);
		  }
		: onSubscribeClick;

	const SubscribeButton = () => (
		<Button
			primary
			disabled={ subscribeDisabled }
			busy={ isSubscribing }
			onClick={ onSubscribeClickEvent }
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
	);

	return (
		<>
			<HStack as="li" className="reader-unsubscribed-feed-item" alignment="center" spacing={ 8 }>
				<VStack className="reader-unsubscribed-feed-item__site-preview-v-stack">
					<HStack>
						<HStack className="reader-unsubscribed-feed-item__site-preview-h-stack" spacing={ 3 }>
							{ isExternalLink ? (
								<ExternalLink
									className="reader-unsubscribed-feed-item__icon"
									href={ feedUrl }
									onClick={ onIconClick }
									target="_blank"
								>
									<SiteIcon iconUrl={ iconUrl } defaultIcon={ defaultIcon } size={ 40 } />
								</ExternalLink>
							) : (
								<a
									className="reader-unsubscribed-feed-item__icon"
									href={ feedUrl }
									onClick={ onIconClick }
								>
									<SiteIcon iconUrl={ iconUrl } defaultIcon={ defaultIcon } size={ 40 } />
								</a>
							) }
							<VStack
								className="reader-unsubscribed-feed-item__title-with-url-v-stack"
								spacing={ 0 }
							>
								{ isExternalLink ? (
									<ExternalLink
										className="reader-unsubscribed-feed-item__title"
										href={ feedUrl }
										target="_blank"
										onClick={ onTitleClick }
									>
										{ title ? title : filteredDisplayUrl }
									</ExternalLink>
								) : (
									<a
										className="reader-unsubscribed-feed-item__title"
										href={ feedUrl }
										onClick={ onTitleClick }
									>
										{ title ? title : filteredDisplayUrl }
									</a>
								) }
								<ExternalLink
									className="reader-unsubscribed-feed-item__url"
									href={ displayUrl }
									target="_blank"
									onClick={ onDisplayUrlClick }
								>
									{ filteredDisplayUrl }
								</ExternalLink>
							</VStack>
						</HStack>
						<div className="reader-unsubscribed-feed-item__description">{ description }</div>

						<div className="reader-unsubscribed-feed-item__subscribe-button">
							<SubscribeButton />
						</div>
					</HStack>
					<div className="reader-unsubscribed-feed-item__mobile-description" aria-hidden="true">
						{ description }
					</div>
					<div className="reader-unsubscribed-feed-item__mobile-subscribe-button">
						<SubscribeButton />
					</div>
				</VStack>
			</HStack>
		</>
	);
};

export default ReaderUnsubscribedFeedItem;
