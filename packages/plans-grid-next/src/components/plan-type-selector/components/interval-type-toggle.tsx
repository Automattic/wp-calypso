import { PLAN_ANNUAL_PERIOD } from '@automattic/calypso-products';
import { SelectDropdown } from '@automattic/components';
import { Plans } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import useMaxDiscount from '../hooks/use-max-discount';
import type { IntervalTypeProps, SupportedUrlFriendlyTermType } from '../../../types';

export const IntervalTypeToggle: React.FunctionComponent< IntervalTypeProps > = ( props ) => {
	const translate = useTranslate();
	const {
		intervalType,
		eligibleForWpcomMonthlyPlans,
		hideDiscount,
		currentSitePlanSlug,
		displayedIntervals,
		useCheckPlanAvailabilityForPurchase,
		coupon,
		siteId,
		onPlanIntervalUpdate,
	} = props;
	const showBiennialToggle = displayedIntervals.includes( '2yearly' );
	const maxDiscount = useMaxDiscount( props.plans, useCheckPlanAvailabilityForPurchase, siteId );
	const pricingMeta = Plans.usePricingMetaForGridPlans( {
		planSlugs: currentSitePlanSlug ? [ currentSitePlanSlug ] : [],
		coupon,
		siteId,
		useCheckPlanAvailabilityForPurchase,
	} );
	const currentPlanBillingPeriod = currentSitePlanSlug
		? pricingMeta?.[ currentSitePlanSlug ]?.billingPeriod
		: null;

	if ( showBiennialToggle ) {
		// skip showing toggle if current plan's term is higher than 1 year
		if ( currentPlanBillingPeriod && PLAN_ANNUAL_PERIOD < currentPlanBillingPeriod ) {
			return null;
		}
	}

	if ( ! showBiennialToggle ) {
		if ( ! eligibleForWpcomMonthlyPlans ) {
			return null;
		}
	}

	const intervalTabs: SupportedUrlFriendlyTermType[] = showBiennialToggle
		? [ 'yearly', '2yearly' ]
		: [ 'monthly', 'yearly' ];

	const getOptionLabel = ( interval: SupportedUrlFriendlyTermType ): React.ReactNode => {
		if ( interval === 'monthly' ) {
			return translate( 'Pay monthly' );
		}
		if ( interval === 'yearly' && ! showBiennialToggle ) {
			const showDiscount = ! hideDiscount && maxDiscount > 0;
			return (
				<>
					{ translate( 'Pay annually' ) }
					{ showDiscount && (
						<>
							{ ' ' }
							<span className="plan-type-selector__discount">
								{ translate( 'Save up to %(maxDiscount)d%%', {
									args: { maxDiscount },
									comment: 'Will be like "Save up to 30%"',
								} ) }
							</span>
						</>
					) }
				</>
			);
		}
		if ( interval === 'yearly' && showBiennialToggle ) {
			return translate( 'Pay 1 year' );
		}
		if ( interval === '2yearly' ) {
			return translate( 'Pay 2 years' );
		}
		return '';
	};

	const options = intervalTabs.map( ( interval ) => ( {
		value: interval,
		label: getOptionLabel( interval ),
	} ) );

	return (
		<div className="plan-type-selector__interval-type">
			<SelectDropdown
				options={ options }
				initialSelected={ intervalType }
				onSelect={ ( option: { value: SupportedUrlFriendlyTermType } ) =>
					onPlanIntervalUpdate( option.value )
				}
			/>
		</div>
	);
};
