import { useTranslate } from 'i18n-calypso';
import {
	SubscriptionAction,
	SubscriptionPrice,
	SubscriptionPurchase,
	SubscriptionStatus,
} from '../field-content';
import type { Subscription } from '../../../types';
import type { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

import './style.scss';

type SubscriptionItemProps = {
	subscription: Subscription;
	products?: APIProductFamilyProduct[];
	isFetching: boolean;
	onCancelSubscription: () => void;
};

const SubscriptionItem = ( {
	subscription,
	products,
	isFetching,
	onCancelSubscription,
}: SubscriptionItemProps ) => {
	const translate = useTranslate();

	const product = products?.find( ( product ) => product.product_id === subscription.product_id );
	const isPressable = product?.slug.startsWith( 'pressable' );

	return (
		<div className="subscriptions-mobile">
			<div className="subscriptions-mobile__content">
				<div className="subscriptions-mobile__header">
					<h3>{ translate( 'PURCHASE' ).toUpperCase() }</h3>
				</div>
				<p className="subscriptions-mobile__product-name">
					<SubscriptionPurchase
						isFetching={ isFetching }
						name={ product?.name }
						isPressable={ isPressable }
					/>
				</p>
			</div>
			<div className="subscriptions-mobile__content">
				<h3>{ translate( 'PRICE' ).toUpperCase() }</h3>
				<p>
					<SubscriptionPrice isFetching={ isFetching } amount={ product?.amount } />
				</p>
			</div>
			<div className="subscriptions-mobile__content">
				<h3>{ translate( 'SUBSCRIPTION STATUS' ).toUpperCase() }</h3>
				<SubscriptionStatus status={ subscription.status } translate={ translate } />
			</div>
			<SubscriptionAction
				subscription={ subscription }
				onCancelSubscription={ onCancelSubscription }
			/>
		</div>
	);
};

const SubscriptionsListMobileView = ( {
	subscriptions,
	title,
	onCancelSubscription,
	isFetchingProducts,
	products,
}: {
	subscriptions?: Subscription[];
	title: string;
	onCancelSubscription: () => void;
	isFetchingProducts: boolean;
	products?: APIProductFamilyProduct[];
} ) => {
	const translate = useTranslate();

	return (
		<div className="subscriptions-mobile__wrapper">
			<div className="subscriptions-mobile__heading">{ title }</div>
			{ subscriptions
				? subscriptions.map( ( subscription ) => (
						<SubscriptionItem
							subscription={ subscription }
							products={ products }
							isFetching={ isFetchingProducts }
							onCancelSubscription={ onCancelSubscription }
						/>
				  ) )
				: translate( 'No subscriptions found' ) }
		</div>
	);
};

export default SubscriptionsListMobileView;
