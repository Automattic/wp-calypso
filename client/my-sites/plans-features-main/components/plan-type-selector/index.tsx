/* eslint-disable @typescript-eslint/no-use-before-define */
import {
	isWpComPlan,
	plansLink,
	isMonthly,
	PLAN_ANNUAL_PERIOD,
	PlanSlug,
	getPlanSlugForTermVariant,
	TERM_ANNUALLY,
} from '@automattic/calypso-products';
import { Popover } from '@automattic/components';
import styled from '@emotion/styled';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { omit } from 'lodash';
import { useEffect, useState } from 'react';
import * as React from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';
import { Primitive } from 'utility-types';
import SegmentedControl from 'calypso/components/segmented-control';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ProvideExperimentData } from 'calypso/lib/explat';
import { addQueryArgs } from 'calypso/lib/url';
import type { UsePricingMetaForGridPlans } from 'calypso/my-sites/plans-grid/hooks/npm-ready/data-store/use-grid-plans';
import './style.scss';

export type PlanTypeSelectorProps = {
	kind: 'interval' | 'customer';
	basePlansPath?: string | null;
	intervalType: string;
	customerType: string;
	withDiscount?: string;
	siteSlug?: string | null;
	selectedPlan?: string;
	selectedFeature?: string;
	showBiennialToggle?: boolean;
	isInSignup: boolean;
	plans: PlanSlug[];
	eligibleForWpcomMonthlyPlans?: boolean;
	isPlansInsideStepper: boolean;
	hideDiscountLabel?: boolean;
	redirectTo?: string | null;
	isStepperUpgradeFlow: boolean;
	currentSitePlanSlug?: PlanSlug | null;
	usePricingMetaForGridPlans: UsePricingMetaForGridPlans;
};

interface PathArgs {
	[ key: string ]: Primitive;
}

type GeneratePathFunction = ( props: Partial< PlanTypeSelectorProps >, args: PathArgs ) => string;

export const generatePath: GeneratePathFunction = ( props, additionalArgs = {} ) => {
	const { intervalType = '' } = additionalArgs;
	const defaultArgs = {
		customerType: null,
		discount: props.withDiscount,
		feature: props.selectedFeature,
		plan: props.selectedPlan,
	};

	if ( props.isInSignup || 'customerType' in additionalArgs || props.isStepperUpgradeFlow ) {
		return addQueryArgs(
			{
				...defaultArgs,
				...additionalArgs,
			},
			document.location?.search
		);
	}

	return addQueryArgs(
		{
			...defaultArgs,
			...omit( additionalArgs, 'intervalType' ),
		},
		plansLink(
			props.basePlansPath || '/plans',
			props.siteSlug,
			intervalType ? String( intervalType ) : '',
			true
		)
	);
};

type PopupMessageProps = {
	context?: HTMLElement;
	isVisible: boolean;
	children?: React.ReactNode;
};

// eslint-disable @typescript-eslint/no-use-before-define
export const PopupMessages: React.FunctionComponent< PopupMessageProps > = ( {
	context,
	children,
	isVisible,
} ) => {
	const timeout = { enter: 300, exit: 10 };
	const inProp = Boolean( isVisible && context );

	return (
		<>
			{ [ 'right', 'bottom' ].map( ( pos ) => (
				<CSSTransition key={ pos } in={ inProp } timeout={ timeout } classNames="popover">
					<StyledPopover
						position={ pos }
						context={ context }
						isVisible={ true }
						autoPosition={ false }
					>
						{ children }
					</StyledPopover>
				</CSSTransition>
			) ) }
		</>
	);
};

export type IntervalTypeProps = Pick<
	PlanTypeSelectorProps,
	| 'intervalType'
	| 'plans'
	| 'isInSignup'
	| 'eligibleForWpcomMonthlyPlans'
	| 'isPlansInsideStepper'
	| 'hideDiscountLabel'
	| 'redirectTo'
	| 'showBiennialToggle'
	| 'selectedPlan'
	| 'selectedFeature'
	| 'currentSitePlanSlug'
	| 'usePricingMetaForGridPlans'
>;

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
	} = props;
	const [ spanRef, setSpanRef ] = useState< HTMLSpanElement >();
	const segmentClasses = classNames( 'plan-features__interval-type', 'price-toggle', {
		'is-signup': isInSignup,
	} );
	const popupIsVisible = Boolean( intervalType === 'monthly' && isInSignup && props.plans.length );
	const maxDiscount = useMaxDiscount( props.plans, usePricingMetaForGridPlans );
	const pricingMeta = usePricingMetaForGridPlans( {
		planSlugs: currentSitePlanSlug ? [ currentSitePlanSlug ] : [],
		withoutProRatedCredits: true,
		storageAddOns: null,
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
		<IntervalTypeToggleWrapper
			showingMonthly={ intervalType === 'monthly' }
			isInSignup={ isInSignup }
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
						<span
							ref={
								intervalType === 'monthly' ? ( ref ) => ref && ! spanRef && setSpanRef( ref ) : null
							}
						>
							{ interval === 'monthly' ? translate( 'Pay monthly' ) : null }
							{ interval === 'yearly' && ! showBiennialToggle ? translate( 'Pay annually' ) : null }
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
		</IntervalTypeToggleWrapper>
	);
};

export const ExperimentalIntervalTypeToggle: React.FunctionComponent< IntervalTypeProps > = (
	props
) => {
	return (
		<ProvideExperimentData name="calypso_show_interval_type_selector_2022_07">
			{ ( isLoading, experimentAssignment ) => {
				if ( isLoading || ! props.intervalType ) {
					return <></>;
				}

				if ( 'treatment' !== experimentAssignment?.variationName ) {
					return <></>;
				}

				return <IntervalTypeToggle { ...props } />;
			} }
		</ProvideExperimentData>
	);
};

type CustomerTypeProps = Pick< PlanTypeSelectorProps, 'customerType' | 'isInSignup' >;

export const CustomerTypeToggle: React.FunctionComponent< CustomerTypeProps > = ( props ) => {
	const translate = useTranslate();
	const { customerType } = props;
	const segmentClasses = classNames( 'plan-features__interval-type', 'is-customer-type-toggle' );

	return (
		<SegmentedControl className={ segmentClasses } primary={ true }>
			<SegmentedControl.Item
				selected={ customerType === 'personal' }
				path={ generatePath( props, { customerType: 'personal' } ) }
			>
				{ translate( 'Blogs and personal sites' ) }
			</SegmentedControl.Item>

			<SegmentedControl.Item
				selected={ customerType === 'business' }
				path={ generatePath( props, { customerType: 'business' } ) }
			>
				{ translate( 'Business sites and online stores' ) }
			</SegmentedControl.Item>
		</SegmentedControl>
	);
};

const PlanTypeSelector: React.FunctionComponent< PlanTypeSelectorProps > = ( {
	kind,
	...props
} ) => {
	useEffect( () => {
		recordTracksEvent( 'calypso_plans_plan_type_selector_view', {
			kind,
		} );
	}, [] );

	if ( kind === 'interval' ) {
		return <IntervalTypeToggle { ...props } />;
	}

	if ( kind === 'customer' ) {
		return <CustomerTypeToggle { ...props } />;
	}

	return null;
};

function useMaxDiscount(
	plans: PlanSlug[],
	usePricingMetaForGridPlans: UsePricingMetaForGridPlans
): number {
	const [ maxDiscount, setMaxDiscount ] = useState( 0 );
	const wpcomMonthlyPlans = ( plans || [] ).filter( isWpComPlan ).filter( isMonthly );
	const yearlyVariantPlanSlugs = wpcomMonthlyPlans
		.map( ( planSlug ) => getPlanSlugForTermVariant( planSlug, TERM_ANNUALLY ) )
		.filter( Boolean ) as PlanSlug[];

	const monthlyPlansPricing = usePricingMetaForGridPlans( {
		planSlugs: wpcomMonthlyPlans,
		withoutProRatedCredits: true,
		storageAddOns: null,
	} );
	const yearlyPlansPricing = usePricingMetaForGridPlans( {
		planSlugs: yearlyVariantPlanSlugs,
		withoutProRatedCredits: true,
		storageAddOns: null,
	} );

	const discounts = wpcomMonthlyPlans.map( ( planSlug ) => {
		const yearlyVariantPlanSlug = getPlanSlugForTermVariant( planSlug, TERM_ANNUALLY );

		if ( ! yearlyVariantPlanSlug ) {
			return 0;
		}

		const monthlyPlanAnnualCost =
			( monthlyPlansPricing?.[ planSlug ]?.originalPrice.full ?? 0 ) * 12;

		if ( ! monthlyPlanAnnualCost ) {
			return 0;
		}

		const yearlyPlanAnnualCost =
			yearlyPlansPricing?.[ yearlyVariantPlanSlug ]?.discountedPrice.full ||
			yearlyPlansPricing?.[ yearlyVariantPlanSlug ]?.originalPrice.full ||
			0;

		return Math.floor(
			( ( monthlyPlanAnnualCost - yearlyPlanAnnualCost ) / ( monthlyPlanAnnualCost || 1 ) ) * 100
		);
	} );
	const currentMaxDiscount = discounts.length ? Math.max( ...discounts ) : 0;

	if ( currentMaxDiscount > 0 && currentMaxDiscount !== maxDiscount ) {
		setMaxDiscount( currentMaxDiscount );
	}

	return currentMaxDiscount || maxDiscount;
}

export default PlanTypeSelector;

const IntervalTypeToggleWrapper = styled.div< { showingMonthly: boolean; isInSignup: boolean } >`
	display: ${ ( { isInSignup } ) => ( isInSignup ? 'flex' : 'block' ) };
	align-content: space-between;
	justify-content: center;
	margin: 0 20px 24px;
`;

const StyledPopover = styled( Popover )`
	&.popover {
		display: none;
		opacity: 0;
		transition-property: opacity, transform;
		transition-timing-function: ease-in;

		&.popover-enter-active {
			opacity: 1;
			transition-duration: 0.3s;
		}

		&.popover-exit,
		&.popover-enter-done {
			opacity: 1;
			transition-duration: 0.01s;
		}

		&.is-right,
		.rtl &.is-left {
			@media ( min-width: 960px ) {
				display: block;
			}

			&.popover-enter {
				transform: translate( 30px, 0 );
			}

			&.popover-enter-active,
			&.popover-enter-done {
				transform: translate( 20px, 0 );
			}

			.popover__arrow {
				border-right-color: var( --color-neutral-100 );
				&::before {
					border-right-color: var( --color-neutral-100 );
				}
			}
		}

		.rtl &.is-left {
			.popover__arrow {
				right: 40px;
				border-left-color: var( --color-neutral-100 );
				&::before {
					border-left-color: var( --color-neutral-100 );
				}
			}

			.popover__inner {
				left: -50px;
			}
		}

		&.is-bottom {
			@media ( max-width: 960px ) {
				display: block;
			}

			&.popover-enter {
				transform: translate( 0, 22px );
			}

			&.popover-enter-active,
			&.popover-enter-done {
				transform: translate( 0, 12px );
			}

			.popover__arrow {
				border-bottom-color: var( --color-neutral-100 );
				&::before {
					border-bottom-color: var( --color-neutral-100 );
				}
			}
		}

		.rtl &.is-bottom {
			.popover__arrow {
				border-right-color: transparent;
			}
		}

		.popover__inner {
			padding: 8px 10px;
			max-width: 210px;
			background-color: var( --color-neutral-100 );
			border-color: var( --color-neutral-100 );
			color: var( --color-neutral-0 );
			border-radius: 2px;
			text-align: left;
		}
	}
`;
