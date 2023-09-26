import { Reader, SubscriptionManager } from '@automattic/data-stores';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import SegmentedControl from 'calypso/components/segmented-control';
import { useRecordPostEmailsSetFrequency } from 'calypso/landing/subscriptions/tracks';
import { useSiteSubscription } from 'calypso/reader/contexts/SiteSubscriptionContext';

const DeliveryFrequencyInput = () => {
	const { data: subscription } = useSiteSubscription();
	const translate = useTranslate();
	const { isLoggedIn } = SubscriptionManager.useIsLoggedIn();
	const recordPostEmailsSetFrequency = useRecordPostEmailsSetFrequency();

	const availableFrequencies = useMemo(
		() => [
			{
				key: Reader.EmailDeliveryFrequency.Instantly,
				label: translate( 'Instantly' ),
			},
			{
				key: Reader.EmailDeliveryFrequency.Daily,
				label: translate( 'Daily' ),
			},
			{
				key: Reader.EmailDeliveryFrequency.Weekly,
				label: translate( 'Weekly' ),
			},
		],
		[ translate ]
	);

	const deliveryFrequency =
		subscription?.deliveryMethods.email?.postDeliverFrequency ??
		Reader.EmailDeliveryFrequency.Instantly;

	const { mutate: updateDeliveryFrequency, isLoading: isUpdating } =
		SubscriptionManager.useSiteDeliveryFrequencyMutation();

	const handleDeliveryFrequencyChange = ( newDeliveryFrequency: Reader.EmailDeliveryFrequency ) => {
		if ( subscription === undefined || ! subscription.blogId ) {
			return;
		}

		// Update post emails delivery frequency
		updateDeliveryFrequency( {
			blog_id: subscription.blogId,
			delivery_frequency: newDeliveryFrequency,
			subscriptionId: Number( subscription.id ),
		} );

		// Record tracks event
		recordPostEmailsSetFrequency( {
			blog_id: String( subscription.blogId ),
			delivery_frequency: newDeliveryFrequency,
		} );
	};

	return (
		<div
			className={ classNames( 'setting-item', 'delivery-frequency-input', {
				'is-logged-in': isLoggedIn,
			} ) }
		>
			{ ! isLoggedIn && (
				<p className="setting-item__label">{ translate( 'Email me new posts' ) }</p>
			) }
			<SegmentedControl
				className={ classNames( 'delivery-frequency-input__control', {
					'is-loading': isUpdating,
				} ) }
			>
				{ availableFrequencies.map( ( { key, label }, index ) => (
					<SegmentedControl.Item
						key={ index }
						selected={ deliveryFrequency === key }
						onClick={ () => handleDeliveryFrequencyChange( key ) }
					>
						{ label }
					</SegmentedControl.Item>
				) ) }
			</SegmentedControl>
		</div>
	);
};

export default DeliveryFrequencyInput;
