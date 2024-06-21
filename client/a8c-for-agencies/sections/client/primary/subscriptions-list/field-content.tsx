import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import StatusBadge from 'calypso/a8c-for-agencies/sections/referrals/common/step-section-item/status-badge';
import CancelSubscriptionAction from '../../cancel-subscription-confirmation-dialog';
import { getSubscriptionStatus } from '../../lib/get-subscription-status';
import { Subscription } from '../../types';

interface Props {
	isFetching: boolean;
}

export function SubscriptionPurchase( { isFetching, name }: Props & { name?: string } ) {
	return isFetching ? <TextPlaceholder /> : name;
}

export function SubscriptionPrice( { isFetching, amount }: Props & { amount?: string } ) {
	return isFetching ? <TextPlaceholder /> : `$${ amount }`;
}

export function SubscriptionStatus( {
	status,
	translate,
}: {
	status: string;
	translate: ( key: string ) => string;
} ) {
	const { children, type } = getSubscriptionStatus( status, translate );
	return children ? <StatusBadge statusProps={ { children, type } } /> : '-';
}

export function SubscriptionAction( {
	subscription,
	onCancelSubscription,
}: {
	subscription: Subscription;
	onCancelSubscription: () => void;
} ) {
	const status = subscription.status;
	const isActive = status === 'active';
	return (
		isActive && (
			<span className="action-button">
				<CancelSubscriptionAction
					subscription={ subscription }
					onCancelSubscription={ onCancelSubscription }
				/>
			</span>
		)
	);
}
