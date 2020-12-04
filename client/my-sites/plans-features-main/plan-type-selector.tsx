/**
 * External dependencies
 */
import React, { useState } from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { Primitive } from 'utility-types';
import { omit } from 'lodash';
import styled from '@emotion/styled';

/**
 * Internal dependencies
 */
import SegmentedControl from 'calypso/components/segmented-control';
import Popover from 'calypso/components/popover';
import { addQueryArgs } from 'calypso/lib/url';
import { plansLink } from 'calypso/lib/plans';

type Props = {
	displayJetpackPlans: boolean;
	withWPPlanTabs: boolean;
	plansWithScroll: boolean;
	basePlansPath?: string | null;
	intervalType: string;
	customerType: string;
	withDiscount?: string;
	hidePersonalPlan: boolean;
	siteSlug?: string | null;
	selectedPlan?: string;
	selectedFeature?: string;
	isInSignup: boolean;

	isMonthlyPricingTest?: boolean;
};

interface PathArgs {
	[ key: string ]: Primitive;
}

type GeneratePathFunction = ( props: Partial< Props >, args: PathArgs ) => string;

export const generatePath: GeneratePathFunction = ( props, additionalArgs = {} ) => {
	const { intervalType = '' } = additionalArgs;
	const plansUrl = props.basePlansPath || '/plans';
	const defaultArgs = {
		customerType: null,
		discount: props.withDiscount,
		feature: props.selectedFeature,
		plan: props.selectedPlan,
	};

	if ( props.isInSignup || 'customerType' in additionalArgs ) {
		return addQueryArgs(
			{
				...defaultArgs,
				...additionalArgs,
			},
			document.location.search
		);
	}

	return addQueryArgs(
		{
			...defaultArgs,
			...omit( additionalArgs, 'intervalType' ),
		},
		plansLink( plansUrl, props.siteSlug, intervalType, true )
	);
};

type PopupMessageProps = {
	context?: HTMLElement;
	isVisible: boolean;
};

export const PopupMessages: React.FunctionComponent< PopupMessageProps > = ( {
	context,
	children,
	isVisible,
} ) => {
	const transitionProps = {
		classNames: 'plan-type-selector__popover',
		timeout: { enter: 300, exit: 10 },
		in: Boolean( isVisible && context ),
	};
	const sharedPopoverProps = {
		className: 'plan-type-selector__popover',
		context,
		isVisible: true,
	};

	return (
		<>
			<CSSTransition { ...transitionProps }>
				<Popover key="right" position="right" { ...sharedPopoverProps }>
					{ children }
				</Popover>
			</CSSTransition>
			<CSSTransition { ...transitionProps }>
				<Popover key="bottom" position="bottom" { ...sharedPopoverProps }>
					{ children }
				</Popover>
			</CSSTransition>
		</>
	);
};

type MonthlyPricingProps = { isMonthlyPricingTest?: boolean };
type IntervalTypeProps = Pick< Props, 'intervalType' > & MonthlyPricingProps;

const IntervalTypeToggleWrapper = styled.div`
	display: flex;
	align-content: space-between;

	> .segmented-control {
		width: auto;
	}
`;

export const IntervalTypeToggle: React.FunctionComponent< IntervalTypeProps > = ( props ) => {
	const translate = useTranslate();
	const { intervalType, isMonthlyPricingTest } = props;
	const [ spanRef, setSpanRef ] = useState< HTMLSpanElement >();
	const segmentClasses = classNames( 'plan-features__interval-type', 'price-toggle', {
		'is-monthly-pricing-test': isMonthlyPricingTest,
		'is-monthly-selected': intervalType === 'monthly',
	} );
	const popupIsVisible = Boolean( isMonthlyPricingTest && intervalType === 'monthly' );

	return (
		<IntervalTypeToggleWrapper>
			<SegmentedControl compact className={ segmentClasses } primary>
				<SegmentedControl.Item
					selected={ intervalType === 'monthly' }
					path={ generatePath( props, { intervalType: 'monthly' } ) }
				>
					<span>
						{ isMonthlyPricingTest ? translate( 'Pay monthly' ) : translate( 'Monthly billing' ) }
					</span>
				</SegmentedControl.Item>

				<SegmentedControl.Item
					selected={ intervalType === 'yearly' }
					path={ generatePath( props, { intervalType: 'yearly' } ) }
				>
					<span ref={ ( ref ) => ref && setSpanRef( ref ) }>
						{ isMonthlyPricingTest ? translate( 'Pay annually' ) : translate( 'Yearly billing' ) }
					</span>
					<PopupMessages context={ spanRef } isVisible={ popupIsVisible }>
						{ translate( 'Save up to 43% by paying annually and get a free domain for one year' ) }
					</PopupMessages>
				</SegmentedControl.Item>
			</SegmentedControl>
		</IntervalTypeToggleWrapper>
	);
};

type CustomerTypeProps = Pick< Props, 'customerType' >;

export const CustomerTypeToggle: React.FunctionComponent< CustomerTypeProps > = ( props ) => {
	const translate = useTranslate();
	const { customerType } = props;
	const segmentClasses = classNames( 'plan-features__interval-type', 'is-customer-type-toggle' );

	return (
		<SegmentedControl className={ segmentClasses } primary>
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

const PlanTypeSelector: React.FunctionComponent< Props > = ( props ) => {
	if ( props.plansWithScroll && ! props.isMonthlyPricingTest ) {
		return null;
	}

	if ( props.displayJetpackPlans || props.isMonthlyPricingTest ) {
		return <IntervalTypeToggle { ...props } isMonthlyPricingTest={ props.isMonthlyPricingTest } />;
	}

	if ( props.withWPPlanTabs && ! props.hidePersonalPlan ) {
		return <CustomerTypeToggle { ...props } />;
	}

	return null;
};

export default PlanTypeSelector;
