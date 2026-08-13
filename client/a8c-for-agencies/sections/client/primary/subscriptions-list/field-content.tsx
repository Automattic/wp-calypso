import { formatCurrency } from '@automattic/number-formatters';
import { Badge } from '@automattic/ui';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { EXTERNAL_PRESSABLE_AUTH_URL } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import CancelSubscriptionAction from '../../cancel-subscription-confirmation-dialog';
import { getSubscriptionStatus } from '../../lib/get-subscription-status';
import { Subscription } from '../../types';

interface Props {
	isFetching: boolean;
}

export function SubscriptionPurchase( {
	isFetching,
	name,
	isPressable,
}: Props & { name?: string; isPressable?: boolean } ) {
	const translate = useTranslate();

	if ( isFetching ) {
		return <TextPlaceholder />;
	}

	return (
		<div className="subscription-purchase">
			{ name }
			{ isPressable && (
				<Button
					className="manage-pressable-link"
					target="_blank"
					rel="norefferer nooppener"
					href={ EXTERNAL_PRESSABLE_AUTH_URL }
					variant="link"
				>
					{ translate( 'Manage in Pressable ↗' ) }
				</Button>
			) }
		</div>
	);
}

export function SubscriptionPrice( {
	isFetching,
	amount,
	currency = 'USD',
	interval = 'month',
}: Props & { amount?: string; currency?: string; interval?: string } ) {
	const translate = useTranslate();

	if ( isFetching ) {
		return <TextPlaceholder />;
	}

	const formatted = formatCurrency( Number( amount ?? 0 ), currency );

	return interval === 'year'
		? /* translators: %(total)s is the price of the subscription per year */
		  translate( '%(total)s/yr', {
				args: { total: formatted },
		  } )
		: /* translators: %(total)s is the price of the subscription per month */
		  translate( '%(total)s/mo', {
				args: { total: formatted },
		  } );
}

export function SubscriptionStatus( {
	status,
	translate,
}: {
	status: string;
	translate: ( key: string ) => string;
} ) {
	const { children, type } = getSubscriptionStatus( status, translate );
	return children ? (
		<Badge className="step-section-item__status" intent={ type }>
			{ children }
		</Badge>
	) : (
		'-'
	);
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
