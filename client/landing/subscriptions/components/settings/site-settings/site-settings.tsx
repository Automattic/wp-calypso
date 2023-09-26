import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useSiteSubscription } from 'calypso/reader/contexts/SiteSubscriptionContext';
import { getFeedUrl } from 'calypso/reader/get-helpers';
import { SubscriptionsEllipsisMenu } from '../../subscriptions-ellipsis-menu';
import { FeedIcon, UnsubscribeIcon } from '../icons';
import DeliveryFrequencyInput from './delivery-frequency-input';
import EmailMeNewCommentsToggle from './email-me-new-comments-toggle';
import EmailMeNewPostsToggle from './email-me-new-posts-toggle';
import NotifyMeOfNewPostsToggle from './notify-me-of-new-posts-toggle';
import './styles.scss';
import '../styles.scss';

const SiteSettings = () => {
	const { isLoggedIn } = SubscriptionManager.useIsLoggedIn();
	const { data } = useSiteSubscription();
	if ( ! data ) {
		throw new Error( 'SiteSettings: site subscription data is undefined' );
	}

	const emailMeNewPostsEnabled = Boolean( data.deliveryMethods.email?.sendPosts );

	return (
		<div className="settings site-settings">
			{ isLoggedIn && (
				<>
					<NotifyMeOfNewPostsToggle />
					<EmailMeNewPostsToggle />
				</>
			) }
			{ emailMeNewPostsEnabled && <DeliveryFrequencyInput /> }
			{ isLoggedIn && <EmailMeNewCommentsToggle /> }
		</div>
	);
};

type SiteSettingsPopoverProps = {
	onUnsubscribe: () => void;
	unsubscribing: boolean;
};

export const SiteSettingsPopover = ( {
	onUnsubscribe,
	unsubscribing,
}: SiteSettingsPopoverProps ) => {
	const { data: subscription } = useSiteSubscription();
	if ( ! subscription ) {
		throw new Error( 'SiteSettingsPopover: site subscription data is undefined' );
	}

	const translate = useTranslate();
	const isWpComSite = Reader.isValidId( subscription.blogId );

	return (
		<SubscriptionsEllipsisMenu popoverClassName="site-settings-popover">
			{ ( close: () => void ) => (
				<>
					{ isWpComSite && (
						<>
							<SiteSettings />
							<hr className="subscriptions__separator" />
						</>
					) }

					<Button
						className={ classNames( 'unsubscribe-button', { 'is-loading': unsubscribing } ) }
						disabled={ unsubscribing }
						icon={ <UnsubscribeIcon className="subscriptions-ellipsis-menu__item-icon" /> }
						onClick={ () => {
							onUnsubscribe();
							close();
						} }
					>
						{ translate( 'Unsubscribe' ) }
					</Button>

					{ /* <Button
						className="site-settings-popover__view-feed"
						icon={ <FeedIcon className="subscriptions-ellipsis-menu__item-icon" /> }
						href={ getFeedUrl( {} ) }
					>
						{ translate( 'View feed' ) }
					</Button> */ }
				</>
			) }
		</SubscriptionsEllipsisMenu>
	);
};

export default SiteSettings;
