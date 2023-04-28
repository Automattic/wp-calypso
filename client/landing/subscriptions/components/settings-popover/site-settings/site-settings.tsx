import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import Separator from 'calypso/components/popover-menu/separator';
import SettingsPopover from '../settings-popover';
import DeliveryFrequencyInput from './delivery-frequency-input';
import NotifyMeOfNewPostsToggle from './notify-me-of-new-posts-toggle';
import UnsubscribeSiteButton from './unsubscribe-site-button';
import type { SiteSubscriptionDeliveryFrequency } from '@automattic/data-stores/src/reader/types';

type SiteSettingsProps = {
	notifyMeOfNewPosts: boolean;
	onNotifyMeOfNewPostsChange: ( value: boolean ) => void;
	deliveryFrequency: SiteSubscriptionDeliveryFrequency;
	onDeliveryFrequencyChange: ( value: SiteSubscriptionDeliveryFrequency ) => void;
	onUnsubscribe: () => void;
	unsubscribing: boolean;
	updatingFrequency: boolean;
};

const SiteSettings = ( {
	notifyMeOfNewPosts,
	onNotifyMeOfNewPostsChange,
	deliveryFrequency,
	onDeliveryFrequencyChange,
	onUnsubscribe,
	unsubscribing,
	updatingFrequency,
}: SiteSettingsProps ) => {
	const translate = useTranslate();

	return (
		<SettingsPopover>
			<NotifyMeOfNewPostsToggle
				value={ notifyMeOfNewPosts }
				onChange={ onNotifyMeOfNewPostsChange }
				isUpdating={ false }
			/>
			<PopoverMenuItem itemComponent="div">
				<p className="settings-popover__item-label">{ translate( 'Email me new posts' ) }</p>
				<DeliveryFrequencyInput
					value={ deliveryFrequency }
					onChange={ onDeliveryFrequencyChange }
					isUpdating={ updatingFrequency }
				/>
			</PopoverMenuItem>
			<Separator />
			<UnsubscribeSiteButton unsubscribing={ unsubscribing } onUnsubscribe={ onUnsubscribe } />
		</SettingsPopover>
	);
};

export default SiteSettings;
