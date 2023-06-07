import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { SettingsPopover } from '../settings-popover';

type PendingSubscriptionSettingsProps = {
	onConfirm: () => void;
	confirming: boolean;
	onDelete: () => void;
	deleting: boolean;
};

const PendingSiteSettings = ( {
	onConfirm,
	confirming,
	onDelete,
	deleting,
}: PendingSubscriptionSettingsProps ) => {
	const translate = useTranslate();
	return (
		<>
			<div className="setting-item">
				<Button
					className="settings-popover__item-button"
					onClick={ onConfirm }
					disabled={ confirming }
				>
					{ translate( 'Confirm' ) }
				</Button>
			</div>

			<hr className="subscriptions__separator" />

			<div className="setting-item">
				<Button
					className="settings-popover__item-button"
					onClick={ onDelete }
					disabled={ deleting }
				>
					{ translate( 'Delete' ) }
				</Button>
			</div>
		</>
	);
};

export const PendingSubscriptionSettingsPopover = ( props: PendingSubscriptionSettingsProps ) => (
	<SettingsPopover>
		<PendingSiteSettings { ...props } />
	</SettingsPopover>
);

export default PendingSiteSettings;
