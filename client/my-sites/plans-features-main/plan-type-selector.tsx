/**
 * External dependencies
 */
import React, { useRef, useState } from 'react';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { Primitive } from 'utility-types';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import SegmentedControl from 'components/segmented-control';
import Popover from 'components/popover';
import { addQueryArgs } from 'lib/url';
import { plansLink } from 'lib/plans';

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

const PlanTypeSelector: React.FunctionComponent< Props > = ( props ) => {
	if ( props.plansWithScroll && ! props.isMonthlyPricingTest ) {
		return null;
	}

	const generatePath = getGeneratePath( props );

	if ( props.displayJetpackPlans || props.isMonthlyPricingTest ) {
		return (
			<IntervalTypeToggle
				{ ...props }
				generatePath={ generatePath }
				isMonthlyPricingTest={ props.isMonthlyPricingTest }
			/>
		);
	}

	if ( props.withWPPlanTabs && ! props.hidePersonalPlan ) {
		return <CustomerTypeToggle { ...props } generatePath={ generatePath } />;
	}

	return null;
};

export default PlanTypeSelector;

interface PathArgs {
	[ key: string ]: Primitive;
}

type GeneratePathFunction = ( args: PathArgs ) => string;
type GeneratePathProps = { generatePath: GeneratePathFunction };

const getGeneratePath = ( props: Props ): GeneratePathFunction => {
	const plansUrl = props.basePlansPath || '/plans';
	const defaultArgs = {
		customerType: null,
		discount: props.withDiscount,
		feature: props.selectedFeature,
		plan: props.selectedPlan,
	};

	return ( additionalArgs = {} ) => {
		const { intervalType = '' } = additionalArgs;

		if ( props.isInSignup ) {
			return addQueryArgs(
				{
					...defaultArgs,
					...additionalArgs,
				},
				location.pathname
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
};

type MonthlyPricingProps = { isMonthlyPricingTest?: boolean };
type IntervalTypeProps = Pick< Props, 'intervalType' > & GeneratePathProps & MonthlyPricingProps;

const IntervalTypeToggle: React.FunctionComponent< IntervalTypeProps > = ( {
	intervalType,
	generatePath,
	isMonthlyPricingTest,
} ) => {
	const translate = useTranslate();
	const [ spanRef, setSpanRef ] = useState< HTMLSpanElement >();
	const segmentClasses = classNames( 'plan-features__interval-type', 'price-toggle', {
		'is-monthly-pricing-test': isMonthlyPricingTest,
	} );
	const popupIsVisible = isMonthlyPricingTest && intervalType === 'monthly';

	return (
		<SegmentedControl compact className={ segmentClasses } primary={ true }>
			<SegmentedControl.Item
				selected={ intervalType === 'monthly' }
				path={ generatePath( { intervalType: 'monthly' } ) }
			>
				{ isMonthlyPricingTest ? translate( 'Pay monthly' ) : translate( 'Monthly billing' ) }
			</SegmentedControl.Item>

			<SegmentedControl.Item
				selected={ intervalType === 'yearly' }
				path={ generatePath( { intervalType: 'yearly' } ) }
			>
				{ isMonthlyPricingTest ? translate( 'Pay annually' ) : translate( 'Yearly billing' ) }
				<span ref={ ( ref ) => ref && setSpanRef( ref ) }></span>
				<Popover
					context={ spanRef }
					isVisible={ popupIsVisible }
					position="right"
					className="plan-features__interval-type-popover"
				>
					{ translate( 'Save up to 43% by paying annually and get a free domain for one year' ) }
				</Popover>
			</SegmentedControl.Item>
		</SegmentedControl>
	);
};

type CustomerTypeProps = Pick< Props, 'customerType' > & GeneratePathProps;

const CustomerTypeToggle: React.FunctionComponent< CustomerTypeProps > = ( {
	customerType,
	generatePath,
} ) => {
	const translate = useTranslate();
	const segmentClasses = classNames( 'plan-features__interval-type', 'is-customer-type-toggle' );

	return (
		<SegmentedControl className={ segmentClasses } primary={ true }>
			<SegmentedControl.Item
				selected={ customerType === 'personal' }
				path={ generatePath( { customerType: 'personal' } ) }
			>
				{ translate( 'Blogs and personal sites' ) }
			</SegmentedControl.Item>

			<SegmentedControl.Item
				selected={ customerType === 'business' }
				path={ generatePath( { customerType: 'business' } ) }
			>
				{ translate( 'Business sites and online stores' ) }
			</SegmentedControl.Item>
		</SegmentedControl>
	);
};
