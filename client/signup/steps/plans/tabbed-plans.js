/**
 * External dependencies
 */
import {
	applyTestFiltersToPlansList,
	findPlansKeys,
	getPlan as getPlanFromKey,
	getYearlyPlanByMonthly,
	isMonthly,
	TERM_MONTHLY,
	TERM_ANNUALLY,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PlanPrice from 'calypso/my-sites/plan-price';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getPlan, getPlanBySlug, getPlanRawPrice } from 'calypso/state/plans/selectors';

/**
 * Internal dependencies
 */
import './tabbed-plans-style.scss';

function TabbedPlans( { currencyCode, onUpgradeClick, planProperties } ) {
	const translate = useTranslate();
	const tabList = [ 'Limited', 'Professional' ];

	const bothPlansData = {
		Professional: [
			translate( 'Unlimited posts/pages/products' ),
			translate( 'World class 24/7 support' ),
			translate( 'Custom domain (free for first year)' ),
			translate( 'WordPress.com ads removed' ),
			translate( 'Ability to sell products/services' ),
			translate( 'Earn ad revenue' ),
			translate( 'Video hosting' ),
			translate( 'Google Analytics' ),
			translate( 'MailChimp integration' ),
		],
		Limited: [
			translate( 'Both plans feature 1' ),
			translate( 'Both plans feature 2' ),
			translate( 'Both plans feature 3' ),
			translate( 'Both plans feature 4' ),
			translate( 'Both plans feature 5' ),
		],
	};

	const featureComparisonData = {
		Professional: [
			{
				featureName: translate( 'Install plugins' ),
				planOne: translate( 'None' ),
				planTwo: translate( '58,000+ Available' ),
			},
			{
				featureName: translate( 'Themes available' ),
				planOne: translate( '25' ),
				planTwo: translate( '8,000 to choose from' ),
			},
			{
				featureName: translate( 'SEO' ),
				planOne: translate( 'Simple' ),
				planTwo: translate( 'Advanced for better ranking' ),
			},
			{
				featureName: translate( 'Storage' ),
				planOne: translate( '100GB (for images and video)' ),
				planTwo: translate( '200GB' ),
			},
			{
				featureName: translate( 'WooCommerce fees' ),
				planOne: translate( '5.5% + 30c' ),
				planTwo: translate( '3.9% + 30c' ),
			},
		],
		Limited: [
			{
				featureName: translate( 'Install plugins' ),
				planOne: translate( 'None' ),
				planTwo: translate( 'None' ),
			},
			{
				featureName: translate( 'Themes available' ),
				planOne: translate( '5' ),
				planTwo: translate( '10' ),
			},
			{
				featureName: translate( 'SEO' ),
				planOne: translate( 'Simple' ),
				planTwo: translate( 'Simple' ),
			},
			{
				featureName: translate( 'Storage' ),
				planOne: translate( '3GB (for images and video)' ),
				planTwo: translate( '10GB' ),
			},
			{
				featureName: translate( 'WooCommerce fees' ),
				planOne: translate( '10% + 30c' ),
				planTwo: translate( '8% + 30c' ),
			},
		],
	};

	const [ bothPlansItems, setBothPlansItems ] = useState( bothPlansData.Professional );
	const [ featureComparison, setFeatureComparison ] = useState(
		featureComparisonData.Professional
	);
	const [ planDetails, setPlanDetails ] = useState();
	const [ selectedTab, setSelectedTab ] = useState( 'Professional' );
	const [ termLength, setTermLength ] = useState( 'annual' );

	const toggleTab = () =>
		selectedTab === tabList[ 0 ] ? setSelectedTab( tabList[ 1 ] ) : setSelectedTab( tabList[ 0 ] );

	const handleUpgradeButtonClick = ( productSlug, productId ) => {
		const args = productSlug === null ? null : { product_slug: productSlug, product_id: productId };
		onUpgradeClick( args );
	};

	useEffect( () => {
		const planFilter =
			selectedTab === 'Professional' ? [ 'Business', 'eCommerce' ] : [ 'Personal', 'Premium' ];

		const displayedPlans = planProperties.filter( ( plan ) =>
			planFilter.includes( plan.planName )
		);

		setBothPlansItems( bothPlansData[ selectedTab ] );
		setFeatureComparison( featureComparisonData[ selectedTab ] );
		setPlanDetails( displayedPlans );
	}, [ selectedTab ] );

	return (
		<>
			<TabContainer>
				{ tabList.map( ( item, index ) =>
					item === selectedTab ? (
						<SelectedTab
							key={ `tab${ index }` }
							className={ `tabbed-plans__tab-${ index + 1 }` }
							onClick={ toggleTab }
						>
							{ item }
						</SelectedTab>
					) : (
						<Tab
							key={ `tab${ index }` }
							className={ `tabbed-plans__tab-${ index + 1 }` }
							onClick={ toggleTab }
						>
							{ item }
						</Tab>
					)
				) }
			</TabContainer>
			<Grid className="tabbed-plans__grid-container">
				{ planDetails &&
					planDetails.map( ( item, index ) => (
						<React.Fragment key={ `planDetails${ index }` }>
							<PlanHeader
								key={ `planHeader${ index }` }
								className={ `tabbed-plans__header-${ index + 1 }` }
							>
								{ translate( 'WordPress %(planName)s', {
									args: { planName: item.planName },
									comment: 'For example, WordPress Business',
								} ) }
							</PlanHeader>
							<PlanPrice
								key={ `planPrice${ index }` }
								className={ `tabbed-plans__price-${ index + 1 }` }
								currencyCode={ currencyCode }
								rawPrice={ termLength === 'annual' ? item.rawPrice : item.rawPriceForMonthlyPlan }
								displayPerMonthNotation={ true }
							/>

							<CtaButton
								key={ `planCta${ index }` }
								className={ `tabbed-plans__button-${ index + 1 }` }
								onClick={ () => handleUpgradeButtonClick( item.planSlug, item.planProductId ) }
							>
								{ translate( 'Start with %(planName)s', {
									args: { planName: item.planName },
									comment: 'For example, Start with Business',
								} ) }
							</CtaButton>
						</React.Fragment>
					) ) }

				{ featureComparison.map( ( item, index ) => (
					<React.Fragment key={ `feature${ index }` }>
						<FeatureTitle
							key={ `featureTitle${ index }` }
							className={ `tabbed-plans__feature-title-${ index + 1 }` }
						>
							{ item.featureName }
						</FeatureTitle>
						<Feature
							key={ `featureItemOne${ index }` }
							className={ `tabbed-plans__feature-1-${ index + 1 }` }
						>
							{ item.planOne }
						</Feature>
						<Feature
							key={ `featureItemTwo${ index }` }
							className={ `tabbed-plans__feature-2-${ index + 1 }` }
						>
							{ item.planTwo }
						</Feature>
					</React.Fragment>
				) ) }

				<BothPlans>
					<BothPlansHeader>{ translate( 'Included with both plans:' ) }</BothPlansHeader>
					{ bothPlansItems.map( ( item, index ) => (
						<BothPlansItem key={ `bothItems${ index }` }>{ item }</BothPlansItem>
					) ) }
				</BothPlans>
			</Grid>
		</>
	);
}

TabbedPlans.propTypes = {
	onUpgradeClick: PropTypes.func,
};

const mapStateToProps = ( state, ownProps ) => {
	const { plans } = ownProps;
	// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
	const planProperties = plans.map( ( plan ) => {
		const planConstantObj = applyTestFiltersToPlansList( plan, undefined );
		const planProductId = planConstantObj.getProductId();
		const planObject = getPlan( state, planProductId );
		const rawPrice = getPlanRawPrice( state, planProductId, true );
		const isMonthlyPlan = isMonthly( plan );
		let annualPricePerMonth = rawPrice;
		if ( isMonthlyPlan ) {
			// Get annual price per month for comparison
			const yearlyPlan = getPlanBySlug( state, getYearlyPlanByMonthly( plan ) );
			if ( yearlyPlan ) {
				annualPricePerMonth = getPlanRawPrice( state, yearlyPlan.product_id, true );
			}
		}
		const monthlyPlanKey = findPlansKeys( {
			group: planConstantObj.group,
			term: TERM_MONTHLY,
			type: planConstantObj.type,
		} )[ 0 ];
		const monthlyPlanProductId = getPlanFromKey( monthlyPlanKey )?.getProductId();
		// This is the per month price of a monthly plan. E.g. $14 for Premium monthly.
		const rawPriceForMonthlyPlan = getPlanRawPrice( state, monthlyPlanProductId, true );

		return {
			annualPricePerMonth,
			currencyCode: getCurrentUserCurrencyCode( state ),
			planName: planObject?.product_name_short,
			planObject,
			planProductId,
			planSlug: planObject?.product_slug,
			rawPrice,
			rawPriceForMonthlyPlan,
		};
	} );
	return {
		planProperties,
	};
};

export default connect( mapStateToProps )( TabbedPlans );

const CtaButton = styled( Button )`
	border: 1px solid black;
	margin: 30px 30px 0 0;
	padding: 10px 36px;
	font-weight: 600;
`;

const Feature = styled.div`
	margin-bottom: 10px;
`;

const FeatureTitle = styled.h2`
	margin-left: 36px;
	font-weight: 600;
`;

const Grid = styled.div`
	border-bottom: 1px solid black;
	border-left: 1px solid black;
	border-right: 1px solid black;
	padding: 0 0 36px 0;
`;
const PlanHeader = styled.div`
	margin-top: 20px;
	font-size: 25px;
`;

const BothPlans = styled.div`
	grid-area: both-plans;
	border-left: 1px solid #ddd;
	margin: 20px;
	padding-left: 20px;
`;

const BothPlansHeader = styled.h2`
	font-size: 20px;
	margin-bottom: 20px;
`;

const BothPlansItem = styled.p`
	font-size: 1rem;
	margin: 0 0 5px 0;
`;

const TabContainer = styled.ul`
	display: flex;
	flex-flow: row nowrap;
	justify-content: flex-start;
	align-items: flex-end;
	border-bottom: 1px solid black;
	margin: 0 -2px -1px -1px;
	border-left: 1px solid white;
	border-right: 1px solid white;
	padding-left: 20px;
`;

const Tab = styled.li`
	padding: 6px 36px;
	list-style: none;
	background-color: #dddddd;
	border: 1px solid black;
	margin: 0 -1px -1px -1px;
`;

const SelectedTab = styled( Tab )`
	background-color: #fff;
	border-bottom: 1px solid white;
	margin: 0 -1px -1px -1px;
`;
