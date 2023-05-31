/* eslint-disable @typescript-eslint/no-use-before-define */
import {
	getYearlyPlanByMonthly,
	isWpComPlan,
	plansLink,
	isMonthly,
	PLAN_ANNUAL_PERIOD,
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
import { useSelector } from 'calypso/state';
import {
	getPlanBySlug,
	getPlanRawPrice,
	getDiscountedRawPrice,
	getPlanBillPeriod,
} from 'calypso/state/plans/selectors';
import { getSitePlanSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { IAppState } from 'calypso/state/types';

export type PlanTypeSelectorProps = {
	kind: 'interval' | 'customer';
	basePlansPath?: string | null;
	intervalType: string;
	customerType: string;
	withDiscount?: string;
	hidePersonalPlan: boolean;
	siteSlug?: string | null;
	selectedPlan?: string;
	selectedFeature?: string;
	showBiannualToggle?: boolean;
	isInSignup: boolean;
	plans: string[];
	eligibleForWpcomMonthlyPlans?: boolean;
	isPlansInsideStepper: boolean;
	hideDiscountLabel: boolean;
	redirectTo?: string | null;
	isStepperUpgradeFlow: boolean;
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
	| 'showBiannualToggle'
	| 'selectedPlan'
	| 'selectedFeature'
>;

export const IntervalTypeToggle: React.FunctionComponent< IntervalTypeProps > = ( props ) => {
	const translate = useTranslate();
	const {
		intervalType,
		isInSignup,
		eligibleForWpcomMonthlyPlans,
		hideDiscountLabel,
		showBiannualToggle,
	} = props;
	const [ spanRef, setSpanRef ] = useState< HTMLSpanElement >();
	const segmentClasses = classNames( 'plan-features__interval-type', 'price-toggle', {
		'is-signup': isInSignup,
	} );
	const popupIsVisible = Boolean( intervalType === 'monthly' && isInSignup && props.plans.length );
	const maxDiscount = useMaxDiscount( props.plans );
	const currentPlanBillingPeriod = useSelector( ( state ) => {
		const currentSitePlanSlug = getSitePlanSlug( state, getSelectedSiteId( state ) );
		return currentSitePlanSlug ? getPlanBillPeriod( state, currentSitePlanSlug ) : null;
	} );

	if ( showBiannualToggle ) {
		// skip showing toggle if current plan's term is higher than 1 year
		if ( currentPlanBillingPeriod && PLAN_ANNUAL_PERIOD < currentPlanBillingPeriod ) {
			return null;
		}
	}

	if ( ! showBiannualToggle ) {
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

	const intervalTabs = showBiannualToggle ? [ 'yearly', '2yearly' ] : [ 'monthly', 'yearly' ];

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
						<span ref={ intervalType === 'monthly' ? ( ref ) => ref && setSpanRef( ref ) : null }>
							{ interval === 'monthly' ? translate( 'Pay monthly' ) : null }
							{ interval === 'yearly' && ! showBiannualToggle ? translate( 'Pay annually' ) : null }
							{ interval === 'yearly' && showBiannualToggle ? translate( 'Pay 1 year' ) : null }
							{ interval === '2yearly' ? translate( 'Pay 2 years' ) : null }
						</span>
						{ ! showBiannualToggle && hideDiscountLabel ? null : (
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

function useMaxDiscount( plans: string[] ): number {
	const wpcomMonthlyPlans = ( plans || [] ).filter( isWpComPlan ).filter( isMonthly );
	const [ maxDiscount, setMaxDiscount ] = useState( 0 );
	const discounts = useSelector( ( state: IAppState ) => {
		return wpcomMonthlyPlans.map( ( planSlug ) => {
			const monthlyPlan = getPlanBySlug( state, planSlug );
			const yearlyPlan = getPlanBySlug( state, getYearlyPlanByMonthly( planSlug ) );

			if ( ! yearlyPlan ) {
				return 0;
			}

			const monthlyPlanAnnualCost =
				( getPlanRawPrice( state, monthlyPlan?.product_id ?? 0 ) ?? 0 ) * 12;
			const rawPrice = getPlanRawPrice( state, yearlyPlan.product_id );
			const discountPrice = getDiscountedRawPrice( state, yearlyPlan.product_id );
			const yearlyPlanCost = discountPrice || rawPrice || 0;

			return Math.floor(
				( ( monthlyPlanAnnualCost - yearlyPlanCost ) / ( monthlyPlanAnnualCost || 1 ) ) * 100
			);
		} );
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

	> .segmented-control.is-compact:not( .is-signup ) {
		margin: 8px auto 16px;
		max-width: 480px;

		.segmented-control__link {
			padding: 8px 12px;
		}
	}

	> .segmented-control.is-signup {
		margin: 0 auto;
		border: solid 1px var( --color-neutral-10 );

		@media screen and ( max-width: 960px ) {
			margin-bottom: ${ ( { showingMonthly } ) => ( showingMonthly ? '65px' : 0 ) };
		}

		.segmented-control__item {
			--color-primary: var( --color-neutral-100 );
			--color-text-inverted: var( --color-neutral-0 );
			--color-primary-light: var( --color-neutral-80 );
			--color-primary-dark: var( --color-neutral-80 );
			--item-padding: 3px;

			padding: var( --item-padding ) 0;

			&:first-of-type {
				padding-left: var( --item-padding );

				.rtl & {
					padding-right: var( --item-padding );
				}
			}

			&:last-of-type {
				padding-right: var( --item-padding );

				.rtl & {
					padding-left: var( --item-padding );
				}
			}

			&:last-of-type .segmented-control__link {
				border-right: none;
			}
		}

		.segmented-control__link {
			border: none;
			padding-top: 6px;
			padding-bottom: 6px;
			color: var( --color-neutral-80 );
		}

		.segmented-control__item:not( .is-selected ) {
			.segmented-control__link:hover {
				background-color: var( --color-neutral-5 );
			}
		}
	}
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
