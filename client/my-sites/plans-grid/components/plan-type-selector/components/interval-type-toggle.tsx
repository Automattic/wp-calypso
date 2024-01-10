import { PLAN_ANNUAL_PERIOD } from '@automattic/calypso-products';
import { SegmentedControl } from '@automattic/components';
import { useState } from '@wordpress/element';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import useMaxDiscount from '../hooks/use-max-discount';
import { IntervalTypeProps } from '../types';
import generatePath from '../utils';
import PopupMessages from './popup-messages';

export const IntervalTypeToggle: React.FunctionComponent< IntervalTypeProps > = ( props ) => {
	const translate = useTranslate();
	const {
		intervalType,
		isInSignup,
		eligibleForWpcomMonthlyPlans,
		hideDiscountLabel,
		showBiennialToggle,
		currentSitePlanSlug,
		usePricingMetaForGridPlans,
		title,
		coupon,
	} = props;
	const [ spanRef, setSpanRef ] = useState< HTMLSpanElement >();
	const segmentClasses = classNames( 'price-toggle', {
		'is-signup': isInSignup,
	} );
	const popupIsVisible = Boolean( intervalType === 'monthly' && isInSignup && props.plans.length );
	const maxDiscount = useMaxDiscount( props.plans, usePricingMetaForGridPlans );
	const pricingMeta = usePricingMetaForGridPlans( {
		planSlugs: currentSitePlanSlug ? [ currentSitePlanSlug ] : [],
		withoutProRatedCredits: true,
		storageAddOns: null,
		coupon,
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

	const additionalPathProps = {
		...( props.redirectTo ? { redirect_to: props.redirectTo } : {} ),
		...( props.selectedPlan ? { plan: props.selectedPlan } : {} ),
		...( props.selectedFeature ? { feature: props.selectedFeature } : {} ),
	};

	const isDomainUpsellFlow = new URLSearchParams( window.location.search ).get( 'domain' );

	const isDomainAndPlanPackageFlow = new URLSearchParams( window.location.search ).get(
		'domainAndPlanPackage'
	);

	const isJetpackAppFlow = new URLSearchParams( window.location.search ).get( 'jetpackAppPlans' );

	const intervalTabs = showBiennialToggle ? [ 'yearly', '2yearly' ] : [ 'monthly', 'yearly' ];

	return (
		<>
			{ title && <div className="plan-type-selector__title">{ title }</div> }
			<div
				className="plan-type-selector__interval-type"
				ref={ intervalType === 'monthly' ? ( ref ) => ref && ! spanRef && setSpanRef( ref ) : null }
			>
				<SegmentedControl compact className={ segmentClasses } primary={ true }>
					{ intervalTabs.map( ( interval ) => (
						<SegmentedControl.Item
							key={ interval }
							selected={ intervalType === interval }
							path={ generatePath( props, {
								intervalType: interval,
								domain: isDomainUpsellFlow,
								domainAndPlanPackage: isDomainAndPlanPackageFlow,
								jetpackAppPlans: isJetpackAppFlow,
								...additionalPathProps,
							} ) }
							isPlansInsideStepper={ props.isPlansInsideStepper }
						>
							<span>
								{ interval === 'monthly' ? translate( 'Pay monthly' ) : null }
								{ interval === 'yearly' && ! showBiennialToggle
									? translate( 'Pay annually' )
									: null }
								{ interval === 'yearly' && showBiennialToggle ? translate( 'Pay 1 year' ) : null }
								{ interval === '2yearly' ? translate( 'Pay 2 years' ) : null }
							</span>
							{ ! showBiennialToggle && hideDiscountLabel ? null : (
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
