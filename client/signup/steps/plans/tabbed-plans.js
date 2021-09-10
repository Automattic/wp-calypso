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
import formatCurrency from '@automattic/format-currency';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getPlan, getPlanBySlug, getPlanRawPrice } from 'calypso/state/plans/selectors';

/**
 * Internal dependencies
 */
import './tabbed-plans-style.scss';
function TabbedPlans( { currencyCode, onUpgradeClick, planProperties } ) {
	const translate = useTranslate();
	const tabList = [ 'Limited', 'Professional' ];

	const featureComparisonData = {
		Professional: [
			{
				featureName: translate( 'Install plugins' ),
				planOne: { included: false, copy: translate( 'None' ) },
				planTwo: { included: true, copy: translate( '58,000+ Available' ) },
				planThree: { included: true, copy: translate( '58,000+ Available' ) },
			},
			{
				featureName: translate( 'Themes available' ),
				planOne: { included: true, copy: translate( '25' ) },
				planTwo: { included: true, copy: translate( '8,000 to choose from' ) },
				planThree: { included: true, copy: translate( '8,000 to choose from' ) },
			},
			{
				featureName: translate( 'SEO' ),
				planOne: { included: true, copy: translate( 'Simple' ) },
				planTwo: { included: true, copy: translate( 'Advanced for better ranking' ) },
				planThree: { included: true, copy: translate( 'Advanced for better ranking' ) },
			},
			{
				featureName: translate( 'Storage' ),
				planOne: { included: true, copy: translate( '100GB (for images and video)' ) },
				planTwo: { included: true, copy: translate( '200GB' ) },
				planThree: { included: true, copy: translate( '200GB' ) },
			},
			{
				featureName: translate( 'eCommerce' ),
				planOne: { included: false, copy: translate( 'Not included' ) },
				planTwo: { included: false, copy: translate( 'Not included' ) },
				planThree: { included: true, copy: translate( 'Included' ) },
			},
		],
		Limited: [
			{
				featureName: translate( 'Install plugins' ),
				planOne: { included: false, copy: translate( 'None' ) },
				planTwo: { included: false, copy: translate( 'None' ) },
			},
			{
				featureName: translate( 'Themes available' ),
				planOne: { included: true, copy: translate( '5' ) },
				planTwo: { included: true, copy: translate( '10' ) },
			},
			{
				featureName: translate( 'SEO' ),
				planOne: { included: true, copy: translate( 'Simple' ) },
				planTwo: { included: true, copy: translate( 'Simple' ) },
			},
			{
				featureName: translate( 'Storage' ),
				planOne: { included: true, copy: translate( '3GB (for images and video)' ) },
				planTwo: { included: true, copy: translate( '10GB' ) },
			},
			{
				featureName: translate( 'WooCommerce fees' ),
				planOne: { included: true, copy: translate( '10% + 30c' ) },
				planTwo: { included: true, copy: translate( '8% + 30c' ) },
			},
		],
	};

	const [ featureComparison, setFeatureComparison ] = useState(
		featureComparisonData.Professional
	);
	const [ planDetails, setPlanDetails ] = useState();
	const [ selectedTab, setSelectedTab ] = useState( 'Professional' );
	const [ termLength, setTermLength ] = useState( 'yearly' );

	const toggleTab = () =>
		selectedTab === tabList[ 0 ] ? setSelectedTab( tabList[ 1 ] ) : setSelectedTab( tabList[ 0 ] );

	const toggleTerm = () =>
		termLength === 'yearly' ? setTermLength( 'monthly' ) : setTermLength( 'yearly' );

	const handleUpgradeButtonClick = ( productSlug, productId ) => {
		const args = productSlug === null ? null : { product_slug: productSlug, product_id: productId };
		onUpgradeClick( args );
	};

	useEffect( () => {
		const planFilter =
			selectedTab === 'Professional'
				? [ 'Premium', 'Business', 'eCommerce' ]
				: [ 'Free', 'Personal' ];

		const displayedPlans = planProperties
			.filter( ( plan ) => planFilter.includes( plan.planName ) )
			.filter( ( plan ) => plan.termLength === termLength || plan.termLength === null );

		// Remove free plan if the user has selected a domain

		setFeatureComparison( featureComparisonData[ selectedTab ] );
		setPlanDetails( displayedPlans );
	}, [ selectedTab, planProperties, termLength ] );

	return (
		<>
			<TabWrapper>
				<Tabs>
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
				</Tabs>
			</TabWrapper>
			<Grid className="tabbed-plans__grid-container">
				<TermToggles>
					<RadioButton>
						<input
							type="radio"
							checked={ termLength === 'monthly' ? 'checked' : '' }
							name="monthly"
							onClick={ toggleTerm }
						/>
						<Checkmark></Checkmark>
						<span>{ translate( 'Monthly' ) }</span>
					</RadioButton>
					<RadioButton>
						<input
							type="radio"
							checked={ termLength === 'yearly' ? 'checked' : '' }
							name="monthly"
							onClick={ toggleTerm }
						/>
						<Checkmark></Checkmark>
						<span>{ translate( 'Yearly' ) }</span>
					</RadioButton>
				</TermToggles>

				{ selectedTab === 'Professional' && <FeaturedPlan /> }

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
							>
								{ formatCurrency( item.rawPrice, currencyCode, { stripZeros: true } ) }
							</PlanPrice>
							<TermDescription className={ `tabbed-plans__term-desc-${ index + 1 }` }>
								{ item.termLength === 'yearly' && (
									<>
										<span>
											{ translate( 'per month billed as %(annualPrice)s annually', {
												args: {
													annualPrice: formatCurrency( item.rawPrice * 12, currencyCode, {
														stripZeros: true,
													} ),
												},
												comment: 'For example, Start with Business',
											} ) }
										</span>
										<Savings>
											{ translate( "You're saving %(savings)s% by paying annually", {
												args: {
													savings: Math.round(
														( ( item.rawPriceForMonthly - item.rawPrice ) /
															item.rawPriceForMonthly ) *
															100
													),
												},
												comment: 'For example, Start with Business',
											} ) }
										</Savings>
									</>
								) }
								{ termLength === 'monthly' && (
									<span>{ translate( 'per month, billed monthly' ) }</span>
								) }
							</TermDescription>
							<CtaButton
								key={ `planCta${ index }` }
								className={ `tabbed-plans__button-${ index + 1 }` }
								onClick={ () => handleUpgradeButtonClick( item.planSlug, item.planProductId ) }
								primary={ item.planName === 'Premium' }
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
						{ item.planOne && (
							<Feature
								key={ `featureItemOne${ index }` }
								className={ `tabbed-plans__feature-1-${ index + 1 }` }
								included={ item.planOne.included }
							>
								{ item.planOne.copy }
							</Feature>
						) }
						{ item.planTwo && (
							<Feature
								key={ `featureItemTwo${ index }` }
								className={ `tabbed-plans__feature-2-${ index + 1 }` }
								included={ item.planTwo.included }
							>
								{ item.planTwo.copy }
							</Feature>
						) }
						{ item.planThree && (
							<Feature
								key={ `featureItemThree${ index }` }
								className={ `tabbed-plans__feature-3-${ index + 1 }` }
								included={ item.planThree.included }
							>
								{ item.planThree.copy }
							</Feature>
						) }
					</React.Fragment>
				) ) }
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
		const rawPriceForMonthly = getPlanRawPrice( state, monthlyPlanProductId, true );

		return {
			annualPricePerMonth,
			currencyCode: getCurrentUserCurrencyCode( state ),
			planName: planObject?.product_name_short,
			planObject,
			planProductId,
			planSlug: planObject?.product_slug,
			rawPrice,
			rawPriceForMonthly,
			termLength: planObject?.product_slug.includes( 'monthly' ) ? 'monthly' : 'yearly',
		};
	} );
	planProperties.unshift( {
		annualPricePerMonth: 0,
		currencyCode: getCurrentUserCurrencyCode( state ),
		planName: 'Free',
		planObject: {},
		planProductId: null,
		planSlug: 'free',
		rawPrice: 0,
		rawPriceForMonthly: 0,
		termLength: null,
	} );
	return {
		planProperties,
	};
};

export default connect( mapStateToProps )( TabbedPlans );

const CtaButton = styled( Button )`
	border: 1px solid #c3c4c7;
	box-sizing: border-box;
	box-shadow: 0px 1px 2px rgba( 0, 0, 0, 0.05 );
	border-radius: 4px;
	font-weight: 500;
	font-size: 14px;
	letter-spacing: 0.32px;
	background: ${ ( props ) => ( props.primary ? '#117ac9' : '#fff' ) };
	color: ${ ( props ) => ( props.primary ? '#fff' : '#2b2d2f' ) };
`;

const Feature = styled.div`
	margin-bottom: 10px;
	border-bottom: 1px solid rgba( 220, 220, 222, 0.2 );
	font-weight: 500;
	font-size: 14px;
	letter-spacing: -0.16px;
	color: ${ ( props ) => ( props.included ? '#2c3338' : '#a7aaad' ) }; ;
`;

const FeatureTitle = styled.h2`
	margin-left: 36px;
	font-weight: normal;
	font-size: 14px;
	letter-spacing: -0.16px;
	color: #2c3338;
`;

const Grid = styled.div`
	padding: 0 0 36px 0;
`;
const PlanHeader = styled.div`
	font-weight: normal;
	font-size: 18px;
	line-height: 24px;
	letter-spacing: 0.32px;
	color: #101517;
`;

const PlanPrice = styled.div`
	font-family: Recoleta;
	font-style: normal;
	font-weight: normal;
	font-size: 44px;
	letter-spacing: 2px;
	color: #000;
`;

const TermDescription = styled.div`
	font-size: 10px;
	color: #787c82;
	letter-spacing: -0.16px;
`;

const Savings = styled( TermDescription )`
	font-weight: 600;
	color: #007017;
`;

const TabWrapper = styled.div`
	display: flex;
	align-content: space-between;
`;

const Tabs = styled.ul`
	display: flex;
	margin: 0 auto;
	padding: 3px;
	list-style: none;
	font-size: 14px;
	font-weight: 500;
	line-height: 20px;
	background-color: #f2f2f2;
	border-radius: 6px;
	color: #1d2327;
`;

const Tab = styled.li`
	padding: 6px 36px;
	cursor: pointer;
`;

const SelectedTab = styled( Tab )`
	background-color: #fff;
	border: 0.5px solid rgba( 0, 0, 0, 0.04 );
	box-shadow: 0px 3px 8px rgba( 0, 0, 0, 0.12 ), 0px 3px 1px rgba( 0, 0, 0, 0.04 );
	border-radius: 5px;
`;

const FeaturedPlan = styled.div`
	grid-column: 2 / 3;
	grid-row: 1 / -1;
	background: #e9eff5;
`;

const TermToggles = styled.div`
	display: flex;
	flex-flow: column nowrap;
	justify-content: flex-start;
`;

const RadioButton = styled.label`
	display: flex;
	justify-content: flex-start;
	align-items: center;
	gap: 15px;
	cursor: pointer;
	font-size: 22px;

	span:last-child {
		order: 2;
		font-weight: 500;
		font-size: 14px;
		letter-spacing: -0.16px;
		color: #2c3338;
	}

	input {
		order: 1;
		margin: 0;
		opacity: 0;
		width: 0;
		height: 0;
		cursor: pointer;

		&:checked + span {
			background-color: #f2f2f2;
		}
		/** Show indicator dot when checked */
		&:checked + span:after {
			display: block;
		}
		:not( :checked ) ~ span:nth-child( 3 ) {
			color: #a7aaad;
		}
	}

	&:hover input + span {
		background-color: #ccc;
	}

	/** Indicator dot styling */
	span:after {
		margin-top: 4px;
		margin-left: 4px;
		width: 8px;
		height: 8px;
		background: #000;
		border-radius: 40px;
	}
`;

const Checkmark = styled.span`
	order: 1;
	height: 16px;
	width: 16px;
	background-color: #fff;
	border-radius: 40px;
	border: 1px solid #dcdcde;

	&:hover {
		background-color: #2196f3;
	}

	&:after {
		content: '';
		display: none;
	}
`;
