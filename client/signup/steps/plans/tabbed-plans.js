import {
	applyTestFiltersToPlansList,
	findPlansKeys,
	getPlan as getPlanFromKey,
	getYearlyPlanByMonthly,
	isMonthly,
	TERM_MONTHLY,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import styled from '@emotion/styled';
import { Icon, image, pages, lifesaver, media, store, currencyDollar } from '@wordpress/icons';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import InfoPopover from 'calypso/components/info-popover';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getPlan, getPlanBySlug, getPlanRawPrice } from 'calypso/state/plans/selectors';
import './tabbed-plans-style.scss';

function SharedFeatures( {
	className = '',
	selectedTab,
	setShowFeatures,
	sharedFeatures,
	showFeatures,
} ) {
	const isMobileView = className.includes( 'mobile' );
	const toggleFeaturesString = showFeatures ? 'Hide all features' : 'Show all features';
	const show = showFeatures || ! isMobileView;

	return (
		<div className={ `tabbed-plans__shared-features-grid ${ className }` }>
			{ isMobileView && (
				<button onClick={ () => setShowFeatures( ! showFeatures ) }>
					{ toggleFeaturesString }
				</button>
			) }
			<SharedFeatureHeader>
				{ selectedTab === 'Professional' ? 'All plans include' : 'Personal plan also includes' }
			</SharedFeatureHeader>
			{ show &&
				sharedFeatures[ selectedTab ].map( ( item, index ) => (
					<SharedFeature key={ `sharedFeature${ index }` }>
						<Icon icon={ item.icon } size={ 24 } />
						<span>{ item.description }</span>
					</SharedFeature>
				) ) }
		</div>
	);
}
function TabbedPlans( { currencyCode, onUpgradeClick, planProperties } ) {
	const tabList = getTabList();
	const featureComparisonData = getFeatureComparisonData();
	const sharedFeatures = getSharedFeatures();
	const bestForStrings = getBestForStrings();

	const [ featureComparison, setFeatureComparison ] = useState(
		featureComparisonData.Professional
	);
	const [ planDetails, setPlanDetails ] = useState();
	const [ selectedTab, setSelectedTab ] = useState( tabList[ 1 ] );
	const [ termLength, setTermLength ] = useState( 'yearly' );
	const [ showFeatures, setShowFeatures ] = useState( false );
	const reduxDispatch = useDispatch();

	const toggleTab = () =>
		selectedTab === tabList[ 0 ] ? setSelectedTab( tabList[ 1 ] ) : setSelectedTab( tabList[ 0 ] );

	const toggleTerm = () =>
		termLength === 'yearly' ? setTermLength( 'monthly' ) : setTermLength( 'yearly' );

	const handleUpgradeButtonClick = ( productSlug, productId ) => {
		const args =
			productSlug === 'free_plan' ? null : { product_slug: productSlug, product_id: productId };
		onUpgradeClick( args );
	};

	const tabHandler = ( event ) => {
		if ( event.code === 'Tab' ) {
			event.preventDefault();
			toggleTab();
		}
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

	useEffect( () => {
		window.addEventListener( 'keydown', tabHandler );

		return () => {
			window.removeEventListener( 'keydown', tabHandler );
		};
	}, [ selectedTab ] );

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
				<TermToggles className="tabbed-plans__term-toggles">
					<RadioButton>
						<input
							type="radio"
							checked={ termLength === 'yearly' ? 'checked' : '' }
							name="monthly"
							onChange={ toggleTerm }
						/>
						<Checkmark></Checkmark>
						<span>{ 'Pay Yearly' }</span>
					</RadioButton>
					<RadioButton>
						<input
							type="radio"
							checked={ termLength === 'monthly' ? 'checked' : '' }
							name="monthly"
							onChange={ toggleTerm }
						/>
						<Checkmark></Checkmark>
						<span>{ 'Pay Monthly' }</span>
					</RadioButton>
				</TermToggles>

				<PlanBorderOne featured={ selectedTab === 'Professional' } />
				<PlanBorderTwo />
				{ selectedTab === 'Professional' && (
					<>
						<FeaturedPlan />
						<PlanBorderThree />
					</>
				) }

				{ planDetails &&
					planDetails.map( ( item, index ) => (
						<React.Fragment key={ `planDetails${ index }` }>
							<PlanHeader
								key={ `planHeader${ index }` }
								className={ `tabbed-plans__header-${ index + 1 }` }
							>
								{ item.planName }
								{ item.planName === 'Premium' && <span>Most Popular</span> }
								<p>{ bestForStrings[ item.planName ] }</p>
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
											{ 'per month billed as ' +
												formatCurrency( item.rawPrice * 12, currencyCode, { stripZeros: true } ) +
												' annually' }
										</span>
										<Savings>
											{ "You're saving " +
												Math.round(
													( ( item.rawPriceForMonthly - item.rawPrice ) /
														item.rawPriceForMonthly ) *
														100
												) +
												'% by paying annually' }
										</Savings>
									</>
								) }
								{ termLength === 'monthly' && <span>per month, billed monthly</span> }
							</TermDescription>
							<CtaButton
								key={ `planCta${ index }` }
								className={ `tabbed-plans__button-${ index + 1 }` }
								onClick={ () => handleUpgradeButtonClick( item.planSlug, item.planProductId ) }
								primary={ item.planName === 'Premium' }
							>
								{ `Start with ${ item.planName }` }
							</CtaButton>
							{ item.planName !== 'Free' && (
								<SharedFeatures
									selectedTab={ selectedTab }
									sharedFeatures={ sharedFeatures }
									showFeatures={ showFeatures }
									setShowFeatures={ setShowFeatures }
									className={ classNames(
										'tabbed-plans__shared-features-mobile',
										`tabbed-plans__shared-features-${ index + 1 }`
									) }
								/>
							) }
						</React.Fragment>
					) ) }

				{ featureComparison.map( ( item, index, arr ) => (
					<React.Fragment key={ `feature${ index }` }>
						<FeatureTitle
							key={ `featureTitle${ index }` }
							className={ `tabbed-plans__feature-title-${ index + 1 }` }
						>
							{ item.featureName }
							<InfoPopover className="tabbed-plans__feature-tip-info" position={ 'right' }>
								{ item.tooltip }
							</InfoPopover>
						</FeatureTitle>
						{ item.planOne && (
							<>
								<Feature
									key={ `featureItemOne${ index }` }
									className={ `tabbed-plans__feature-1-${ index + 1 }` }
									included={ item.planOne.included }
									isLast={ arr.length === index + 1 }
								>
									<span>{ item.planOne.copy }</span>
									{ item.planOne.mobileCopy && <span>{ item.planOne.mobileCopy }</span> }
								</Feature>
							</>
						) }
						{ item.planTwo && (
							<Feature
								key={ `featureItemTwo${ index }` }
								className={ `tabbed-plans__feature-2-${ index + 1 }` }
								included={ item.planTwo.included }
								isLast={ arr.length === index + 1 }
							>
								<span>{ item.planTwo.copy }</span>
								{ item.planTwo.mobileCopy && <span>{ item.planTwo.mobileCopy }</span> }
							</Feature>
						) }
						{ item.planThree && (
							<Feature
								key={ `featureItemThree${ index }` }
								className={ `tabbed-plans__feature-3-${ index + 1 }` }
								included={ item.planThree.included }
								isLast={ arr.length === index + 1 }
							>
								<span>{ item.planThree.copy }</span>
								{ item.planThree.mobileCopy && <span>{ item.planThree.mobileCopy }</span> }
							</Feature>
						) }
					</React.Fragment>
				) ) }
				<FreeBanner>
					Not sure which plan to choose?{ ' ' }
					<button href="#" onClick={ () => handleUpgradeButtonClick( null ) }>
						Explore our Free option
					</button>
				</FreeBanner>
				<SharedFeatures selectedTab={ selectedTab } sharedFeatures={ sharedFeatures } />
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
			termLength: isMonthlyPlan ? 'monthly' : 'yearly',
		};
	} );
	planProperties.unshift( {
		annualPricePerMonth: 0,
		currencyCode: getCurrentUserCurrencyCode( state ),
		planName: 'Free',
		planObject: {},
		planProductId: 1,
		planSlug: 'free_plan',
		rawPrice: 0,
		rawPriceForMonthly: 0,
		termLength: null,
	} );
	return {
		planProperties,
	};
};

export default connect( mapStateToProps )( TabbedPlans );

function getTabList() {
	return [ 'Limited', 'Professional' ];
}

function getBestForStrings() {
	return {
		Free: 'Best for sampling',
		Personal: 'Best for getting started',
		Premium: 'Best for freelancers',
		Business: 'Best for small business',
		eCommerce: 'Best for online stores',
	};
}

function getFeatureComparisonData() {
	const data = {
		Professional: [
			{
				featureName: 'Install plugins',
				tooltip:
					'Plugins are like apps for your site. They add new functionality and features to expand your site. There are over 58,000+ WordPress plugins available for anything you need.',
				planOne: { included: false, copy: 'Not included', mobileCopy: null },
				planTwo: {
					included: true,
					copy: '58,000+ Available',
					mobileCopy: '58,000+ plugins available',
				},
				planThree: {
					included: true,
					copy: '58,000+ Available',
					mobileCopy: '58,000+ plugins available',
				},
			},
			{
				featureName: 'Install custom themes',
				tooltip:
					'Themes change the design of your site. We provide dozens of professional free themes for a wide range of uses. On the Business and eCommerce plan, you can also install any 3rd party WordPress theme, free or paid, from the 8,000 custom themes made by 3rd party designers.',
				planOne: {
					included: false,
					copy: 'Not included',
					mobileCopy: null,
				},
				planTwo: {
					included: true,
					copy: '8,000 to choose from',
					mobileCopy: '8,000 themes to choose from',
				},
				planThree: {
					included: true,
					copy: '8,000 to choose from',
					mobileCopy: '8,000 themes to choose from',
				},
			},
			{
				featureName: 'eCommerce',
				tooltip:
					'Build, manage, and scale your online store with unlimited products or services, multiple currencies, integrations with top shipping carriers, and eCommerce marketing tools.',
				planOne: { included: false, copy: 'Not included', mobileCopy: null },
				planTwo: {
					included: false,
					copy: 'Not included',
					mobileCopy: null,
				},
				planThree: {
					included: true,
					copy: 'Complete eCommerce platform',
					mobileCopy: 'Complete eCommerce platform',
				},
			},
			{
				featureName: 'Custom domain name',
				tooltip:
					'Remove “.wordpress.com” from your site address with a custom domain of your choosing. Free for one year (will renew at its regular price).',
				planOne: {
					included: true,
					copy: 'Free for the first year',
					mobileCopy: 'Free domain for the first year',
				},
				planTwo: {
					included: true,
					copy: 'Free for the first year',
					mobileCopy: 'Free domain for the first year',
				},
				planThree: {
					included: true,
					copy: 'Free for the first year',
					mobileCopy: 'Free domain for the first year',
				},
			},
			{
				featureName: 'SEO',
				tooltip:
					'SEO (Search Engine Optimization) helps your site rank higher, and more accurately in search engines, so more people can find your site.',
				planOne: {
					included: true,
					copy: 'Simple',
					mobileCopy: 'Simple SEO',
				},
				planTwo: {
					included: true,
					copy: 'Professional for better ranking',
					mobileCopy: 'Professional SEO',
				},
				planThree: {
					included: true,
					copy: 'Professional for better ranking',
					mobileCopy: 'Professional SEO',
				},
			},
			{
				featureName: 'Customer support',
				tooltip:
					'Keep moving forward with your site at any time. Our Happiness Engineers will help you via email, live chat, or 24/7 priority live chat, depending on the plan you choose.',
				planOne: {
					included: true,
					copy: 'Live chat and email',
					mobileCopy: '100GB Storage',
				},
				planTwo: {
					included: true,
					copy: '24/7 Priority live chat',
					mobileCopy: '24/7 Priority live chat',
				},
				planThree: {
					included: true,
					copy: '24/7 Priority live chat',
					mobileCopy: '24/7 Priority live chat',
				},
			},
			{
				featureName: 'Storage',
				tooltip:
					'With increased storage space, you’ll be able to upload more images, audio, and documents to your website. On the Premium, Business, and eCommerce plans, you can upload videos, too.',
				planOne: { included: true, copy: '10GB storage', mobileCopy: null },
				planTwo: { included: true, copy: '200GB storage', mobileCopy: null },
				planThree: {
					included: true,
					copy: '200GB storage',
					mobileCopy: '200GB storage',
				},
			},
		],
		Limited: [
			{
				featureName: 'Install plugins',
				tooltip:
					'Plugins are like apps for your site. They add new functionality and features to expand your site. There are over 58,000+ WordPress plugins available for anything you need.',
				planOne: { included: false, copy: 'Not included', mobileCopy: null },
				planTwo: { included: false, copy: 'Not included', mobileCopy: null },
			},
			{
				featureName: 'Install custom themes',
				tooltip:
					'Themes change the design of your site. We provide dozens of professional free themes for a wide range of uses. On the Business and eCommerce plan, you can also install any 3rd party WordPress theme, free or paid, from the 8,000 custom themes made by 3rd party designers.',
				planOne: {
					included: false,
					copy: 'Not included',
					mobileCopy: null,
				},
				planTwo: {
					included: false,
					copy: 'Not included',
					mobileCopy: null,
				},
			},
			{
				featureName: 'eCommerce',
				tooltip:
					'Build, manage, and scale your online store with unlimited products or services, multiple currencies, integrations with top shipping carriers, and eCommerce marketing tools.',
				planOne: { included: false, copy: 'Not included', mobileCopy: null },
				planTwo: { included: false, copy: 'Not included', mobileCopy: null },
			},
			{
				featureName: 'Custom domain name',
				tooltip:
					'Remove “.wordpress.com” from your site address with a custom domain of your choosing. Free for one year (will renew at its regular price).',
				planOne: { included: false, copy: 'Not included', mobileCopy: null },
				planTwo: {
					included: true,
					copy: 'Free for the first year',
					mobileCopy: 'Free domain for the first year.',
				},
			},
			{
				featureName: 'SEO',
				tooltip:
					'SEO (Search Engine Optimization) helps your site rank higher, and more accurately in search engines, so more people can find your site.',
				planOne: {
					included: false,
					copy: '—',
					mobileCopy: null,
				},
				planTwo: {
					included: true,
					copy: 'Simple',
					mobileCopy: 'Simple SEO',
				},
			},
			{
				featureName: 'Customer support',
				tooltip:
					'Keep moving forward with your site at any time. Our Happiness Engineers will help you via email, live chat, or 24/7 priority live chat, depending on the plan you choose.',
				planOne: {
					included: false,
					copy: 'Not included',
					mobileCopy: null,
				},
				planTwo: {
					included: true,
					copy: 'Email support',
					mobileCopy: 'Email support',
				},
			},
			{
				featureName: 'Remove WordPress.com Ads',
				tooltip:
					'Allow your visitors to visit and read your website without seeing any WordPress.com advertising.',
				planOne: { included: false, copy: 'No', mobileCopy: null },
				planTwo: { included: true, copy: 'Yes', mobileCopy: null },
			},
		],
	};

	return data;
}

function getSharedFeatures() {
	const data = {
		Limited: [
			{
				icon: pages,
				description: 'Unlimited posts and pages',
			},
			{
				icon: lifesaver,
				description: 'Best-in-class managed hosting',
			},
			{
				icon: lifesaver,
				description: 'Free SSL certificante',
			},
			{
				icon: lifesaver,
				description: '6GB of storage',
			},
			{
				icon: image,
				description: 'WordPress.com ads removed',
			},
			{
				icon: store,
				description: 'Accept simple payments and donations',
			},
		],
		Professional: [
			{
				icon: pages,
				description: 'Unlimited posts and pages',
			},
			{
				icon: lifesaver,
				description: 'Best-in-class managed hosting',
			},
			{
				icon: image,
				description: 'WordPress.com ads removed',
			},
			{
				icon: media,
				description: 'Video hosting',
			},
			{
				icon: store,
				description: 'Accept simple payments and donations',
			},
			{
				icon: currencyDollar,
				description: 'Earn ad revenue',
			},
			{
				icon: image,
				description: 'Google Analytics',
			},
			{
				icon: image,
				description: 'Professional email marketing integration.',
			},
		],
	};

	return data;
}

const SharedFeatureHeader = styled.div`
	grid-column: 1 / 4;
	grid-row: 1;
	justify-self: stretch;
	margin: 25px 24px;
	padding-bottom: 10px;
	border-bottom: 1px solid rgba( 220, 220, 222, 0.5 );

	@media ( max-width: 600px ) {
		display: none;
	}
`;
const SharedFeature = styled.div`
	padding: 5px 0;
	font-weight: 400;

	svg {
		vertical-align: middle;
		color: #c3c4c7;
	}

	svg + span {
		margin-left: 15px;
	}

	@media ( max-width: 600px ) {
		svg {
			display: none;
		}

		svg + span {
			margin-left: 0;
		}
	}
`;

const CtaButton = styled( Button )`
	margin: 15px 24px 32px 24px;
	border: 1px solid #c3c4c7;
	box-sizing: border-box;
	box-shadow: 0px 1px 2px rgba( 0, 0, 0, 0.05 );
	border-radius: 4px;
	font-weight: 500;
	font-size: 14px;
	letter-spacing: 0.32px;
	background: ${ ( props ) => ( props.primary ? '#117ac9' : '#fff' ) };
	color: ${ ( props ) => ( props.primary ? '#fff' : '#2b2d2f' ) };

	@media ( max-width: 600px ) {
		margin: 24px 56px;
	}
`;

const Feature = styled.div`
	padding: 15px 24px;
	border-bottom: ${ ( props ) => ( props.isLast ? '0' : '1px solid rgba( 220, 220, 222, 0.2 )' ) };
	font-weight: 500;
	font-size: 14px;
	letter-spacing: -0.16px;
	color: ${ ( props ) => ( props.included ? '#2c3338' : '#a7aaad' ) };

	span:first-of-type {
		display: block;

		& + span {
			display: none;
		}
	}
	@media ( max-width: 600px ) {
		margin: 0 56px;
		padding: 7px 0;
		border: 0;

		span:first-of-type {
			display: none;

			& + span {
				display: block;
			}
		}
	}
`;

const FeatureTitle = styled.div`
	justify-self: end;
	padding: 15px 36px 15px 0;
	align-self: center;
	font-weight: 500;
	font-size: 14px;
	letter-spacing: -0.16px;
	color: #2c3338;

	button {
		margin-left: 15px;
		font-size: 1em;
		vertical-align: text-top;

		svg {
			color: #a7aaad;
		}
	}

	@media ( max-width: 600px ) {
		display: none;
	}
`;

const Grid = styled.div`
	padding: 0 0 36px 0;
`;
const PlanHeader = styled.div`
	padding: 24px 24px 0 24px;
	font-weight: normal;
	font-size: 18px;
	line-height: 24px;
	letter-spacing: 0.32px;
	color: #101517;

	p {
		font-size: 14px;
	}

	span {
		float: right;
		padding: 1px 8px;
		color: #00450c;
		font-size: 12px;
		font-weight: 500;
		letter-spacing: 0.2px;
		line-height: 20px;
		background: rgba( 184, 230, 191, 0.64 );
		border-radius: 4px;
	}

	@media ( max-width: 600px ) {
		padding: 56px 0 0 56px;

		span {
			margin-right: 60px;
		}
	}
`;

const PlanPrice = styled.div`
	padding: 0 24px;
	font-family: Recoleta;
	font-style: normal;
	font-weight: normal;
	font-size: 44px;
	letter-spacing: 2px;
	color: #000;

	@media ( max-width: 600px ) {
		padding-left: 56px;
	}
`;

const TermDescription = styled.div`
	padding: 0 24px 24px 24px;
	font-size: 10px;
	color: #787c82;
	letter-spacing: -0.16px;

	@media ( max-width: 600px ) {
		padding-left: 56px;
	}
`;

const Savings = styled.p`
	margin: 5px 0 0 0;
	padding: 0;
	font-weight: 600;
	font-size: 10px;
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
	margin-bottom: 50px;
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
	grid-row: 1 / button-1;
	background: rgba( 241, 245, 248, 0.6 );
`;

const TermToggles = styled.div`
	padding-top: 24px;
	display: flex;
	flex-flow: column nowrap;
	justify-content: flex-start;

	@media ( max-width: 600px ) {
		padding-left: 24px;
	}
`;

const RadioButton = styled.label`
	display: flex;
	justify-content: flex-start;
	align-items: center;
	cursor: pointer;
	font-size: 22px;

	span:last-child {
		order: 2;
		margin-left: 15px;
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
		:not( :checked ) ~ span:nth-of-type( 3 ) {
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
	@media ( max-width: 600px ) {
		padding-bottom: 15px;
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

const PlanBorderOne = styled.div`
	@media ( max-width: 600px ) {
		margin: 24px 24px 0 24px;
		grid-column: 1;
		grid-row: plan-header-1 / shared-features-1;
		border-radius: 2px;
		background: ${ ( props ) => ( props.featured ? '#f1f5f8' : '#fff' ) };
		border: ${ ( props ) => ( props.featured ? '0' : '1px solid #dcdcde' ) };
	}
`;

const PlanBorderTwo = styled.div`
	@media ( max-width: 600px ) {
		margin: 24px 24px 0 24px;
		grid-column: 1;
		grid-row: plan-header-2 / shared-features-2;
		border: 1px solid #dcdcde;
		border-radius: 2px;
	}
`;

const PlanBorderThree = styled.div`
	@media ( max-width: 600px ) {
		margin: 24px 24px 0 24px;
		grid-column: 1;
		grid-row: plan-header-3 / shared-features-3;
		border: 1px solid #dcdcde;
		border-radius: 2px;
	}
`;
const FreeBanner = styled.p`
	grid-area: free-banner;
	margin: 24px 0;
	padding: 7px 0;
	font-size: 14px;
	background: lightgray;
	text-align: center;

	@media ( max-width: 600px ) {
		margin: 24px 24px;
	}
`;
