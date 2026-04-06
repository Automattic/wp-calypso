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
	endDate?: string | null;
	title?: string;
	is_complimentary: boolean;
	is_free: boolean;
	comp_id?: number;
};

type PlanData = {
	is_complimentary: boolean;
	renewal_price: number;
	comp_id?: number;
	renewalPrice: string;
	when: string;
	start_date: string;
	end_date: string | null;
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
		const defaultSubscription: PlanData[] = [
			{
				is_complimentary: false,
				renewal_price: 0,
				renewalPrice: freePlan,
				when: '',
				title: '',
				start_date: '',
				end_date: '',
			},
		];

		if ( ! subscriptions?.length ) {
			return defaultSubscription;
		}

		// Filter out legacy gift subscriptions and transform in a single pass.
		const plans = subscriptions.reduce< PlanData[] >( ( acc, subscription ) => {
			if ( subscription.is_gift && ! subscription.is_comp ) {
				return acc;
			}

			acc.push( {
				is_complimentary: !! subscription.is_comp,
				comp_id: subscription.comp_id,
				renewal_price: subscription.renewal_price,
				renewalPrice: formatRenewalPrice( subscription.renewal_price, subscription.currency ),
				when: getPaymentInterval(
					subscription.renew_interval,
					subscription.inactive_renew_interval
				),
				start_date: subscription.start_date,
				end_date: subscription.end_date,
				title: subscription.title,
			} );

			return acc;
		}, [] );

		return plans.length ? plans : defaultSubscription;
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
				endDate: plan.end_date,
				title: plan.title,
				is_complimentary: plan.is_complimentary,
				is_free: plan.renewal_price === 0,
				comp_id: plan.comp_id,
			} ) );
		}
		return [];
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ subscriber ] );

	return subscriptionPlans;
};

export default useSubscriptionPlans;
