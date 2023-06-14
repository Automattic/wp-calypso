import { getCurrencyObject } from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { Subscriber, SubscriptionPlan } from '../types';

const useAddSubscriptions = ( rawSubscribers: Subscriber[] ): Subscriber[] => {
	const translate = useTranslate();

	const getPaymentInterval = ( renew_interval: string ) => {
		if ( renew_interval === null ) {
			return translate( 'one time' );
		} else if ( renew_interval === '1 month' ) {
			return translate( 'per month' );
		} else if ( renew_interval === '1 year' ) {
			return translate( 'per year' );
		}
	};

	function formatRenewalPrice( renewalPrice: number, currency: string ) {
		if ( ! renewalPrice ) {
			return '';
		}

		const money = getCurrencyObject( renewalPrice, currency );
		return money.integer !== '0' ? `${ money.symbol }${ money.integer } /` : '';
	}

	const transformSubscriptions = ( subscriptions?: SubscriptionPlan[] ) => {
		const defaultSubscription = [ { renewalPrice: translate( 'Free tier' ), when: '' } ];

		if ( subscriptions ) {
			const result = subscriptions.map( ( subscription: SubscriptionPlan ) => {
				const { currency, renewal_price, renew_interval } = subscription;
				const renewalPrice = formatRenewalPrice( renewal_price, currency );
				const when = getPaymentInterval( renew_interval );

				return { renewalPrice, when };
			} );

			return result || defaultSubscription;
		}

		return defaultSubscription;
	};

	const transformedSubscribers = useMemo(
		() =>
			rawSubscribers
				? rawSubscribers.map( ( subscriber: Subscriber ) => {
						const subscriptionObjects = transformSubscriptions( subscriber.plans );
						return {
							...subscriber,
							subscriptions: subscriptionObjects.map(
								( subscription ) => `${ subscription.renewalPrice } ${ subscription.when }`
							),
						};
				  } )
				: [],
		[ rawSubscribers ]
	);

	return transformedSubscribers;
};

export default useAddSubscriptions;
