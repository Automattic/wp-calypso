import { getCurrencyObject } from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { Subscriber, SubscriptionPlan } from '../types';

const freePlan = 'Free';

const useSubscriptionPlans = ( subscriber: Subscriber ): string[] => {
	const translate = useTranslate();

	const getPaymentInterval = ( renew_interval: string ) => {
		if ( renew_interval === null ) {
			return translate( 'one time' );
		} else if ( renew_interval === '1 month' ) {
			return translate( 'Monthly' );
		} else if ( renew_interval === '1 year' ) {
			return translate( 'Yearly' );
		}
	};

	function formatRenewalPrice( renewalPrice: number, currency: string ) {
		if ( ! renewalPrice ) {
			return '';
		}

		const money = getCurrencyObject( renewalPrice, currency );
		return money.integer !== '0' ? `${ money.symbol }${ money.integer }` : '';
	}

	const transformSubscriptionPlans = ( subscriptions?: SubscriptionPlan[] ) => {
		const defaultSubscription = [ { renewalPrice: translate( 'Free' ), when: '' } ];

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

	const subscriptionPlans = useMemo( () => {
		if ( subscriber ) {
			const plans = transformSubscriptionPlans( subscriber.plans );
			return plans.map( ( plan ) =>
				plan.renewalPrice === freePlan
					? plan.renewalPrice
					: `${ plan.when } (${ plan.renewalPrice })`
			);
		}
		return [];
	}, [ subscriber ] );

	return subscriptionPlans;
};

export default useSubscriptionPlans;
