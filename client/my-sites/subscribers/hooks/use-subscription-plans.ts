import { getCurrencyObject } from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { ReactNode, useMemo } from 'react';
import {
	PLAN_YEARLY_FREQUENCY,
	PLAN_MONTHLY_FREQUENCY,
} from 'calypso/my-sites/earn/memberships/constants';
import { Subscriber, SubscriptionPlan } from '../types';

type SubscriptionPlanData = {
	plan: ReactNode;
	startDate?: string;
	title?: string;
};

const useSubscriptionPlans = ( subscriber: Subscriber ): SubscriptionPlanData[] => {
	const translate = useTranslate();
	const freePlan = translate( 'Free' );

	const getPaymentInterval = ( renew_interval: string ) => {
		if ( renew_interval === null ) {
			return translate( 'one time' );
		} else if ( renew_interval === PLAN_MONTHLY_FREQUENCY ) {
			return translate( 'Monthly' );
		} else if ( renew_interval === PLAN_YEARLY_FREQUENCY ) {
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
		const defaultSubscription = [
			{
				renewalPrice: freePlan,
				when: '',
				title: undefined,
				start_date: undefined,
			},
		];

		if ( subscriptions ) {
			const result = subscriptions.map( ( subscription: SubscriptionPlan ) => {
				const { currency, renewal_price, renew_interval, start_date, title } = subscription;
				const renewalPrice = formatRenewalPrice( renewal_price, currency );
				const when = getPaymentInterval( renew_interval );

				return { renewalPrice, when, start_date, title };
			} );

			return result || defaultSubscription;
		}

		return defaultSubscription;
	};

	const subscriptionPlans = useMemo( () => {
		if ( subscriber ) {
			const plans = transformSubscriptionPlans( subscriber.plans );
			return plans.map( ( plan ) => ( {
				plan:
					plan.renewalPrice === freePlan
						? plan.renewalPrice
						: `${ plan.when } (${ plan.renewalPrice })`,
				startDate: plan.start_date,
				title: plan.title,
			} ) );
		}
		return [];
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ subscriber ] );

	return subscriptionPlans;
};

export default useSubscriptionPlans;
