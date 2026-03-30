import { getCurrencyObject } from '@automattic/number-formatters';
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
	is_complimentary: boolean;
	is_free: boolean;
	gift_id?: number;
	comp_id?: number;
};

type PlanData = {
	is_complimentary: boolean;
	renewal_price: number;
	gift_id?: number;
	comp_id?: number;
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
				is_complimentary: false,
				renewal_price: 0,
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
					gift_id,
					is_comp,
					comp_id,
					currency,
					renewal_price,
					renew_interval,
					inactive_renew_interval,
					start_date,
					title,
				} = subscription;
				const renewalPrice = formatRenewalPrice( renewal_price, currency );
				const when = getPaymentInterval( renew_interval, inactive_renew_interval );
				const isComplimentary = !! ( is_gift || is_comp );

				return {
					is_complimentary: isComplimentary,
					gift_id,
					comp_id,
					renewal_price,
					renewalPrice,
					when,
					start_date,
					title,
				};
			} );

			return result || defaultSubscription;
		}

		return defaultSubscription;
	};

	const getPlanDisplay = ( plan: PlanData ): string => {
		if ( plan.is_complimentary ) {
			return (
				translate( 'Comp', {
					comment: 'Short for "complimentary" — a free subscription granted by the site creator',
				} ) + `: ${ plan.title }`
			);
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
				is_complimentary: plan.is_complimentary,
				is_free: plan.renewal_price === 0,
				gift_id: plan.gift_id,
				comp_id: plan.comp_id,
			} ) );
		}
		return [];
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ subscriber ] );

	return subscriptionPlans;
};

export default useSubscriptionPlans;
