import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { SubscriptionsEllipsisMenu } from '../../subscriptions-ellipsis-menu';

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
					className="subscriptions-ellipsis-menu__item-button"
					onClick={ onConfirm }
					disabled={ confirming }
				>
					{ translate( 'Confirm' ) }
				</Button>
			</div>

			<hr className="subscriptions__separator" />

			<div className="setting-item">
				<Button
					className="subscriptions-ellipsis-menu__item-button"
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
	<SubscriptionsEllipsisMenu>
		<PendingSiteSettings { ...props } />
	</SubscriptionsEllipsisMenu>
);

export default PendingSiteSettings;
