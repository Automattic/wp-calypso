import { PLAN_ANNUAL_PERIOD } from '@automattic/calypso-products';
import { SegmentedControl } from '@automattic/components';
import { Plans } from '@automattic/data-stores';
import { useState } from '@wordpress/element';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import useMaxDiscount from '../hooks/use-max-discount';
import PopupMessages from './popup-messages';
import type { IntervalTypeProps, SupportedUrlFriendlyTermType } from '../../../types';

export const IntervalTypeToggle: React.FunctionComponent< IntervalTypeProps > = ( props ) => {
	const translate = useTranslate();
	const {
		intervalType,
		isInSignup,
		eligibleForWpcomMonthlyPlans,
		hideDiscount,
		currentSitePlanSlug,
		displayedIntervals,
		useCheckPlanAvailabilityForPurchase,
		title,
		coupon,
		siteId,
		onPlanIntervalUpdate,
	} = props;
	const showBiennialToggle = displayedIntervals.includes( '2yearly' );
	const [ spanRef, setSpanRef ] = useState< HTMLSpanElement >();
	const segmentClasses = clsx( 'price-toggle', {
		'is-signup': isInSignup,
	} );
	const popupIsVisible = Boolean( intervalType === 'monthly' && props.plans.length );
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

	return (
		<>
			{ title && <div className="plan-type-selector__title">{ title }</div> }
			<div
				className="plan-type-selector__interval-type"
				ref={ intervalType === 'monthly' ? ( ref ) => ref && ! spanRef && setSpanRef( ref ) : null }
			>
				<SegmentedControl compact className={ segmentClasses } primary>
					{ intervalTabs.map( ( interval ) => (
						<SegmentedControl.Item
							key={ interval }
							selected={ intervalType === interval }
							onClick={ () => onPlanIntervalUpdate( interval ) }
						>
							<span>
								{ interval === 'monthly' ? translate( 'Pay monthly' ) : null }
								{ interval === 'yearly' && ! showBiennialToggle
									? translate( 'Pay annually' )
									: null }
								{ interval === 'yearly' && showBiennialToggle ? translate( 'Pay 1 year' ) : null }
								{ interval === '2yearly' ? translate( 'Pay 2 years' ) : null }
							</span>
							{ ! showBiennialToggle && hideDiscount ? null : (
								<PopupMessages context={ spanRef } isVisible={ popupIsVisible }>
									{ translate(
										'Save up to %(maxDiscount)d%% by paying annually and get a free domain for one year',
										{
											args: { maxDiscount },
											comment: 'Will be like "Save up to 30% by paying annually..."',
										}
									) }
								</PopupMessages>
							) }
						</SegmentedControl.Item>
					) ) }
				</SegmentedControl>
			</div>
		</>
	);
};
