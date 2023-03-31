import PopoverMenuItem from 'calypso/components/popover-menu/item';
import Separator from 'calypso/components/popover-menu/separator';
import SettingsPopover from '../settings-popover';
import DeliveryFrequencyInput from './delivery-frequency-input';
import UnfollowSiteButton from './unfollow-site-button';
import type { SiteSubscriptionDeliveryFrequency } from '@automattic/data-stores/src/reader/types';

type SiteSettingsProps = {
	deliveryFrequency: SiteSubscriptionDeliveryFrequency;
	onDeliveryFrequencyChange: ( value: SiteSubscriptionDeliveryFrequency ) => void;
	onUnfollow: () => void;
};

const SiteSettings = ( {
	deliveryFrequency,
	onDeliveryFrequencyChange,
	onUnfollow,
}: SiteSettingsProps ) => (
	<SettingsPopover>
		<PopoverMenuItem itemComponent="div">
			<DeliveryFrequencyInput value={ deliveryFrequency } onChange={ onDeliveryFrequencyChange } />
		</PopoverMenuItem>
		<Separator />
		<UnfollowSiteButton onUnfollow={ onUnfollow } />
	</SettingsPopover>
);

export default SiteSettings;
