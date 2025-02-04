import { getCurrencyObject } from '@automattic/format-currency';
import { useTranslate } from 'i18n-calypso';
import { ReactNode, useMemo } from 'react';
import {
	PLAN_YEARLY_FREQUENCY,
	PLAN_MONTHLY_FREQUENCY,
} from 'calypso/my-sites/earn/memberships/constants';
import { Subscriber, SubscriptionPlan } from '../types';

export type SubscriptionPlanData = {
	plan: ReactNode;
	startDate?: string;
	title?: string;
	is_gift: boolean;
};

type PlanData = {
	is_gift: boolean;
	renewalPrice: string;
	when: string;
	start_date: string;
	title: string;
};

const useSubscriptionPlans = ( subscriber: Subscriber ): SubscriptionPlanData[] => {
	const translate = useTranslate();
	const freePlan = translate( 'Free' );

	const getPaymentInterval = (
		renew_interval: string,
		inactive_renew_interval: string
	): string => {
		renew_interval = renew_interval || inactive_renew_interval;
		if ( renew_interval === null ) {
			return translate( 'one time' );
		} else if ( renew_interval === PLAN_MONTHLY_FREQUENCY ) {
			return translate( 'Monthly' );
		} else if ( renew_interval === PLAN_YEARLY_FREQUENCY ) {
			return translate( 'Yearly' );
		}

		return '';
	};

	function formatRenewalPrice( renewalPrice: number, currency: string ) {
		if ( ! renewalPrice ) {
			return '';
		}
		const money = getCurrencyObject( renewalPrice, currency, { stripZeros: false } );
		return money.hasNonZeroFraction
			? `${ money.symbol }${ money.integer }${ money.fraction }`
			: `${ money.symbol }${ money.integer }`;
	}

	const transformSubscriptionPlans = ( subscriptions?: SubscriptionPlan[] ): PlanData[] => {
		const defaultSubscription = [
			{
				is_gift: false,
				renewalPrice: freePlan,
				when: '',
				title: '',
				start_date: '',
			},
		];

		if ( subscriptions ) {
			const result = subscriptions.map( ( subscription: SubscriptionPlan ) => {
				const {
					is_gift,
					currency,
					renewal_price,
					renew_interval,
					inactive_renew_interval,
					start_date,
					title,
				} = subscription;
				const renewalPrice = formatRenewalPrice( renewal_price, currency );
				const when = getPaymentInterval( renew_interval, inactive_renew_interval );

				return { is_gift, renewalPrice, when, start_date, title };
			} );

			return result || defaultSubscription;
		}

		return defaultSubscription;
	};

	const getPlanDisplay = ( plan: PlanData ): string => {
		if ( plan.is_gift ) {
			return translate( 'Gift' ) + `: ${ plan.title }`;
		} else if ( plan.renewalPrice === freePlan ) {
			return plan.renewalPrice;
		}

		return `${ plan.when } (${ plan.renewalPrice })`;
	};

	const subscriptionPlans = useMemo( () => {
		if ( subscriber ) {
			const plans = transformSubscriptionPlans( subscriber.plans );
			return plans.map( ( plan: PlanData ) => ( {
				plan: getPlanDisplay( plan ),
				startDate: plan.start_date,
				title: plan.title,
				is_gift: plan.is_gift,
			} ) );
		}
		return [];
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ subscriber ] );

	return subscriptionPlans;
};

export default useSubscriptionPlans;
