import { PLAN_ANNUAL_PERIOD } from '@automattic/calypso-products';
import { Popover, SegmentedControl } from '@automattic/components';
import styled from '@emotion/styled';
import { useState } from '@wordpress/element';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';
import useMaxDiscount from '../hooks/use-max-discount';
import { IntervalTypeProps } from '../types';
import generatePath from '../utils';

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

type PopupMessageProps = {
	context?: HTMLElement;
	isVisible: boolean;
	children?: React.ReactNode;
};

const PopupMessages: React.FunctionComponent< PopupMessageProps > = ( {
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
			<div className="plan-type-selector__interval-type">
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
									intervalType === 'monthly'
										? ( ref ) => ref && ! spanRef && setSpanRef( ref )
										: null
								}
							>
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
