import {
	applyTestFiltersToPlansList,
	findPlansKeys,
	getPlan as getPlanFromKey,
	isMonthly,
	TERM_MONTHLY,
} from '@automattic/calypso-products';
import { Button, Gridicon, Popover } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { isWithinBreakpoint, subscribeIsWithinBreakpoint } from '@automattic/viewport';
import styled from '@emotion/styled';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef } from 'react';
import { connect, useDispatch } from 'react-redux';
import InfoPopover from 'calypso/components/info-popover';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getPlan, getPlanRawPrice } from 'calypso/state/plans/selectors';
import './tabbed-plans-style.scss';

function SharedFeatures( {
	className = '',
	featureDescription = '',
	sharedFeatures,
	mobileView = false,
} ) {
	const [ showFeatures, setShowFeatures ] = useState( false );
	const featuresString = showFeatures ? 'Hide all features' : 'Show all features';
	const show = showFeatures || ! mobileView;

	return (
		<div className={ `tabbed-plans__shared-features-grid ${ className }` }>
			{ mobileView && (
				<div>
					<button onClick={ () => setShowFeatures( ! showFeatures ) }>{ featuresString }</button>
					<span>
						<Gridicon icon={ show ? 'chevron-up' : 'chevron-down' } size={ 12 } />
					</span>
				</div>
			) }
			{ ! mobileView && <SharedFeatureHeader>{ featureDescription }</SharedFeatureHeader> }
			{ show &&
				sharedFeatures.map( ( item, index ) => (
					<SharedFeature key={ `sharedFeature${ index }` }>
						<Gridicon icon={ item.icon } size={ 24 } />
						<span>{ item.description }</span>
					</SharedFeature>
				) ) }
		</div>
	);
}

function TermToggleRadioButton( {
	isChecked,
	children,
	isDisabled = false,
	name,
	popoverMessage = null,
	toggleAction,
} ) {
	const [ showPopover, setShowPopover ] = useState( false );
	const radioPopoverRef = useRef( null );

	const handleClick = () => ( popoverMessage ? setShowPopover( true ) : null );
	const handleClose = () => setShowPopover( false );

	const PopoverMessage = styled.div`
		padding: 10px;
		width: 150px;
		text-align: left;
	`;

	return (
		<RadioButtonLabel isDisabled={ isDisabled } onClick={ handleClick }>
			<input type="radio" checked={ isChecked } name={ name } onChange={ toggleAction } />
			<Checkmark />
			<span ref={ radioPopoverRef }>{ children }</span>
			{ showPopover && popoverMessage && (
				<Popover
					context={ radioPopoverRef.current }
					isVisible
					onClose={ handleClose }
					position="bottom"
				>
					<PopoverMessage>{ popoverMessage }</PopoverMessage>
				</Popover>
			) }
		</RadioButtonLabel>
	);
}
function TabbedPlans( {
	bestForStrings,
	featureDescriptions,
	featuresOrder,
	onUpgradeClick,
	planFeatureDescriptions,
	planOrder,
	planProperties,
	sharedFeatures,
	tabList,
} ) {
	const [ selectedTab, setSelectedTab ] = useState( tabList[ 1 ] );
	const [ termLength, setTermLength ] = useState( 'annually' );
	const [ displayedPlans, setDisplayedPlans ] = useState( planOrder[ selectedTab ] );
	const [ planDetails, setPlanDetails ] = useState();
	const [ isLoading, setIsLoading ] = useState( true );
	const [ isMobile, setIsMobile ] = useState( false );
	const [ primaryPlan, setPrimaryPlan ] = useState( 'Business' );
	const dispatch = useDispatch();

	const toggleTab = () => {
		setIsLoading( true );
		selectedTab === tabList[ 0 ] ? setSelectedTab( tabList[ 1 ] ) : setSelectedTab( tabList[ 0 ] );
	};

	const toggleTerm = () =>
		termLength === 'annually' ? setTermLength( 'monthly' ) : setTermLength( 'annually' );

	const handleUpgradeButtonClick = ( productSlug, productId ) => {
		const args =
			productSlug === 'free_plan' ? null : { product_slug: productSlug, product_id: productId };

		dispatch(
			recordTracksEvent( 'calypso_signup_plans_page_clicks', {
				plan: productSlug,
			} )
		);

		onUpgradeClick( args );
	};

	const setPlanOrderForDisplaySize = () => {
		isMobile
			? setDisplayedPlans( planOrder.mobile[ selectedTab ] )
			: setDisplayedPlans( planOrder[ selectedTab ] );
	};

	const filterPlans = ( planArray ) =>
		planArray.map( ( plan ) => {
			return planProperties.filter( ( obj ) => {
				return obj.planName === plan && obj.termLength === termLength;
			} )[ 0 ];
		} );

	useEffect( () => {
		setIsLoading( true );
		setTermLength( 'annually' );
		selectedTab === tabList[ 0 ] ? setPrimaryPlan( 'Premium' ) : setPrimaryPlan( 'Business' );
		setPlanOrderForDisplaySize();
		dispatch(
			recordTracksEvent( 'calypso_signup_plans_page_clicks', {
				tab: selectedTab,
			} )
		);
	}, [ selectedTab ] );

	useEffect( () => {
		dispatch(
			recordTracksEvent( 'calypso_signup_plans_page_clicks', {
				term: termLength,
			} )
		);
	}, [ termLength ] );

	useEffect( () => {
		setIsLoading( true );
		const filteredPlans = filterPlans( displayedPlans );
		setPlanDetails( filteredPlans );
		setIsLoading( false );
	}, [ displayedPlans, planProperties, termLength ] );

	useEffect( () => {
		setPlanOrderForDisplaySize();
	}, [ isMobile ] );

	useEffect( () => {
		if ( isWithinBreakpoint( '<660px' ) ) {
			setIsMobile( true );
			setDisplayedPlans( planOrder.mobile[ selectedTab ] );
		}
		subscribeIsWithinBreakpoint( '<660px', ( isActive ) => setIsMobile( isActive ) );
	}, [] );

	if ( isLoading ) return null;

	return (
		<>
			<TabWrapper>
				<Tabs>
					{ tabList.map( ( item, index ) =>
						item === selectedTab ? (
							<SelectedTab key={ `tab${ index }` } tabOrder={ index + 1 } onClick={ toggleTab }>
								<span>{ item }</span>
							</SelectedTab>
						) : (
							<Tab key={ `tab${ index }` } tabOrder={ index + 1 } onClick={ toggleTab }>
								<a href={ `?selectTab=${ tabList[ index ] } ` }>{ item }</a>
							</Tab>
						)
					) }
				</Tabs>
			</TabWrapper>
			<Grid className="tabbed-plans__grid-container">
				<TermToggles>
					<TermToggleRadioButton
						isChecked={ termLength === 'annually' }
						name="annually"
						toggleAction={ toggleTerm }
					>
						<span>Pay annually</span>
					</TermToggleRadioButton>
					<TermToggleRadioButton
						isChecked={ termLength === 'monthly' }
						isDisabled={ selectedTab === 'Starter' }
						name="monthly"
						popoverMessage={
							selectedTab === 'Starter'
								? `Monthly payments are only available for our Professional plans.`
								: null
						}
						toggleAction={ toggleTerm }
					>
						<span>Pay monthly</span>
					</TermToggleRadioButton>
				</TermToggles>

				{ ! isLoading &&
					planDetails.map( ( plan, index ) => (
						<React.Fragment key={ `planDetails${ index }` }>
							<PlanStyle
								key={ `planDetails${ index }` }
								planOrder={ index + 1 }
								featured={ plan.planName === primaryPlan }
							/>
							<PlanHeader key={ `planHeader${ index }` } planOrder={ index + 1 }>
								{ plan.planName }
								{ selectedTab === 'Starter' && plan.planName === 'Premium' && (
									<span>Best to start</span>
								) }
								{ plan.planName === 'Business' && <span>Best Value</span> }
								<p>{ bestForStrings[ plan.planName ] }</p>
							</PlanHeader>
							<PlanPrice key={ `planPrice${ index }` } planOrder={ index + 1 }>
								{ formatCurrency( plan.rawPrice, plan.currencyCode, { stripZeros: true } ) }
							</PlanPrice>
							<TermDescription planOrder={ index + 1 }>
								{ plan.planName === 'Free' && <span>Limited features</span> }
								{ plan.termLength === 'annually' && plan.planName !== 'Free' && (
									<span>
										{ `billed as
										${ formatCurrency( Math.round( plan.rawPrice * 12 ), plan.currencyCode, {
											stripZeros: true,
										} ) }
										annually` }
									</span>
								) }
								{ termLength === 'monthly' && plan.planName !== 'Free' && (
									<span>per month, billed monthly</span>
								) }
								<Savings>
									{ selectedTab === 'Professional' && termLength === 'annually' ? (
										<>
											{ "You're saving " +
												Math.round(
													( ( plan.rawPriceForMonthly - plan.rawPrice ) /
														plan.rawPriceForMonthly ) *
														100
												) +
												'% by paying annually' }
										</>
									) : (
										<>&nbsp;</>
									) }
								</Savings>
							</TermDescription>
							{ plan.planName !== 'Free' && (
								<CtaButton
									key={ `planCtaTop${ index }` }
									planOrder={ index + 1 }
									position="top"
									onClick={ () => handleUpgradeButtonClick( plan.planSlug, plan.planProductId ) }
									primary={ plan.planName === primaryPlan }
								>
									{ `Start with ${ plan.planName }` }
								</CtaButton>
							) }

							{ featuresOrder[ selectedTab ].map( ( feature, featureIndex ) => {
								const featureObject =
									planFeatureDescriptions[ plan.planName ][ feature ][ termLength ];
								const featureIncluded =
									Object.keys( featureObject ).length !== 0 && featureObject?.notIncluded !== true;
								const notIncluded = <Gridicon icon="cross" size={ 18 } />;
								let featureDescriptionCopy;
								if ( isMobile ) {
									if ( featureIncluded ) {
										featureDescriptionCopy = featureObject?.mobileCopy
											? featureObject.mobileCopy
											: featureObject.copy;
									} else {
										return null;
									}
								} else {
									featureDescriptionCopy = featureObject?.copy ? featureObject.copy : notIncluded;
								}

								return (
									<Feature
										key={ `feature${ index }${ featureIndex }` }
										included={ featureIncluded }
										gridArea={ `feature-${ index + 1 }-${ featureIndex + 1 }` }
									>
										{ featureDescriptionCopy }
									</Feature>
								);
							} ) }

							<CtaButton
								key={ `planCta${ index }` }
								planOrder={ index + 1 }
								onClick={ () => handleUpgradeButtonClick( plan.planSlug, plan.planProductId ) }
								primary={ plan.planName === primaryPlan }
							>
								{ `Start with ${ plan.planName }` }
							</CtaButton>

							{ isMobile && plan.planName !== 'Free' && (
								<SharedFeatures
									sharedFeatures={ sharedFeatures[ selectedTab ] }
									className={ classNames(
										'tabbed-plans__shared-features-mobile',
										`tabbed-plans__shared-features-${ index + 1 }`
									) }
									mobileView={ true }
								/>
							) }
						</React.Fragment>
					) ) }

				{ featuresOrder[ selectedTab ].map( ( feature, index, arr ) => (
					<FeatureTitle
						key={ `featureTitle${ index }` }
						gridArea={ `ft-${ index + 1 }` }
						isLast={ arr.length === index + 1 }
					>
						{ featureDescriptions[ feature ].name }
						<InfoPopover
							className="tabbed-plans__feature-tip-info"
							icon="info"
							iconSize={ 15 }
							position="right"
							showOnHover={ true }
						>
							{ featureDescriptions[ feature ].tooltip }
						</InfoPopover>
					</FeatureTitle>
				) ) }

				{ ! isMobile && (
					<>
						<FreeBanner>
							{ selectedTab === 'Professional' && (
								<>
									Need something simple to start?{ ' ' }
									<button href="#" onClick={ () => toggleTab() }>
										Explore our Starter plans
									</button>
								</>
							) }
							{ selectedTab === 'Starter' && (
								<>
									Need eCommerce or professional features?{ ' ' }
									<button href="#" onClick={ () => toggleTab() }>
										Explore our Professional plans
									</button>
								</>
							) }
						</FreeBanner>

						<SharedFeatures
							featureDescription={
								selectedTab === 'Professional'
									? 'All Professional plans include'
									: 'Personal and Premium plans also include'
							}
							sharedFeatures={ sharedFeatures[ selectedTab ] }
						/>
					</>
				) }
			</Grid>
		</>
	);
}

TabbedPlans.propTypes = {
	onUpgradeClick: PropTypes.func,
	bestForStrings: PropTypes.object,
	featureDescriptions: PropTypes.object,
	featuresOrder: PropTypes.object,
	planFeatureDescriptions: PropTypes.object,
	planOrder: PropTypes.object,
	planProperties: PropTypes.array,
	sharedFeatures: PropTypes.object,
	tabList: PropTypes.array,
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
		const monthlyPlanKey = findPlansKeys( {
			group: planConstantObj.group,
			term: TERM_MONTHLY,
			type: planConstantObj.type,
		} )[ 0 ];
		const monthlyPlanProductId = getPlanFromKey( monthlyPlanKey )?.getProductId();
		// This is the per month price of a monthly plan. E.g. $14 for Premium monthly.
		const rawPriceForMonthly = getPlanRawPrice( state, monthlyPlanProductId, true );

		return {
			currencyCode: getCurrentUserCurrencyCode( state ),
			planName: planObject?.product_name_short,
			planProductId,
			planSlug: planObject?.product_slug,
			rawPrice,
			rawPriceForMonthly,
			termLength: isMonthlyPlan ? 'monthly' : 'annually',
		};
	} );
	planProperties.push(
		{
			currencyCode: getCurrentUserCurrencyCode( state ),
			planName: 'Free',
			planProductId: 1,
			planSlug: 'free_plan',
			rawPrice: 0,
			rawPriceForMonthly: 0,
			termLength: 'monthly',
		},
		{
			currencyCode: getCurrentUserCurrencyCode( state ),
			planName: 'Free',
			planProductId: 1,
			planSlug: 'free_plan',
			rawPrice: 0,
			rawPriceForMonthly: 0,
			termLength: 'annually',
		}
	);
	return {
		planProperties,
		tabList: getTabList(),
		planOrder: getPlanOrder(),
		bestForStrings: getBestForStrings(),
		featuresOrder: getFeaturesOrder(),
		featureDescriptions: getFeatureDescriptions(),
		planFeatureDescriptions: getPlanFeatureDescriptions(),
		sharedFeatures: getSharedFeatures(),
	};
};

export default connect( mapStateToProps )( TabbedPlans );

function getTabList() {
	return [ 'Starter', 'Professional' ];
}

function getPlanOrder() {
	return {
		Starter: [ 'Free', 'Personal', 'Premium' ],
		Professional: [ 'Premium', 'Business', 'eCommerce' ],
		mobile: {
			Starter: [ 'Premium', 'Personal', 'Free' ],
			Professional: [ 'Business', 'Premium', 'eCommerce' ],
		},
	};
}

function getBestForStrings() {
	return {
		Free: 'Ads displayed on all sites',
		Personal: 'Best for small sites & blogs',
		Premium: 'Best for customized sites & blogs',
		Business: 'Best for professional sites & blogs',
		eCommerce: 'Best for online stores',
	};
}

function getFeaturesOrder() {
	return {
		Starter: [ 'plugins', 'themes', 'ecommerce', 'domains', 'css', 'support', 'videos' ],
		Professional: [ 'plugins', 'themes', 'ecommerce', 'domains', 'seo', 'support', 'storage' ],
	};
}
function getFeatureDescriptions() {
	return {
		css: {
			name: 'CSS Customization',
			tooltip:
				'Customize your selected theme template with extended color schemes, background designs, and complete control over website CSS.',
		},
		domains: {
			name: 'Custom domain name',
			tooltip:
				'Remove “.wordpress.com” from your site address with a custom domain of your choosing. Free for one year (will renew at its regular price).',
		},
		ecommerce: {
			name: 'eCommerce',
			tooltip:
				'Build, manage, and scale your online store with unlimited products or services, multiple currencies, integrations with top shipping carriers, and eCommerce marketing tools.',
		},
		plugins: {
			name: 'Install plugins',
			tooltip:
				'Plugins are like apps for your site. They add new functionality and features to expand your site. There are over 58,000+ WordPress plugins available for anything you need.',
		},
		removeAds: {
			name: 'Remove ads',
			tooltip:
				'Allow your visitors to visit and read your website without seeing any WordPress.com advertising.',
		},
		seo: {
			name: 'SEO',
			tooltip:
				'SEO (Search Engine Optimization) helps your site rank higher, and more accurately in search engines, so more people can find your site.',
		},
		storage: {
			name: 'Storage',
			tooltip:
				'With increased storage space, you’ll be able to upload more images, audio, and documents to your website. On the Premium, Business, and eCommerce plans, you can upload videos, too.',
		},
		support: {
			name: 'Customer support',
			tooltip:
				'Keep moving forward with your site at any time. Our Happiness Engineers will help you via email, live chat, or 24/7 priority live chat, depending on the plan you choose.',
		},
		themes: {
			name: 'Install themes',
			tooltip:
				'Themes change the design of your site. We provide dozens of professional free themes for a wide range of uses. On the Business and eCommerce plan, you can also install any 3rd party WordPress theme, free or paid, from the 8,000 custom themes made by 3rd party designers.',
		},
		videos: {
			name: 'Upload videos',
			tooltip:
				'Upload, host, and have total control of video files so you can place them anywhere you want on your website.',
		},
	};
}

function getPlanFeatureDescriptions() {
	return {
		Free: {
			css: { annually: {} },
			domains: { annually: {} },
			ecommerce: { annually: {} },
			plugins: { annually: {} },
			removeAds: { annually: {} },
			seo: { annually: {} },
			support: { annually: {} },
			themes: { annually: {} },
			videos: { annually: {} },
		},
		Personal: {
			css: { annually: {} },
			ecommerce: { annually: {} },
			domains: {
				annually: { copy: 'Free for the first year', mobileCopy: 'Free domain for the first year' },
			},
			plugins: { annually: {} },
			removeAds: {
				annually: { copy: 'Ads removed' },
			},
			seo: {
				annually: { copy: 'Simple', mobileCopy: 'Simple SEO' },
			},
			support: {
				annually: { copy: 'Email support' },
			},
			themes: { annually: {} },
			videos: { annually: {} },
		},
		Premium: {
			css: { annually: { copy: 'Supported' } },
			domains: {
				annually: { copy: 'Free for the first year', mobileCopy: 'Free domain for the first year' },
				monthly: { notIncluded: true, copy: 'Included with annual plans' },
			},
			ecommerce: { annually: {}, monthly: {} },
			plugins: { annually: {}, monthly: {} },
			removeAds: {
				annually: { copy: 'Ads removed' },
			},
			seo: {
				annually: { copy: 'Simple', mobileCopy: 'Simple SEO' },
				monthly: { copy: 'Simple', mobileCopy: 'Simple SEO' },
			},
			storage: {
				annually: { copy: '13GB storage' },
				monthly: { copy: '13GB storage' },
			},
			support: {
				annually: { copy: 'Live chat and email support' },
				monthly: { copy: 'Email support' },
			},
			themes: { annually: {}, monthly: {} },
			videos: { annually: { copy: 'Yes' } },
		},
		Business: {
			plugins: {
				annually: { copy: '58,000+ available', mobileCopy: '58,000+ plugins available' },
				monthly: {
					included: false,
					copy: '58,000+ available',
					mobileCopy: '58,000+ plugins available',
				},
			},
			themes: {
				annually: { copy: '8,000 to choose from', mobileCopy: '8,000 themes to choose from' },
				monthly: { copy: '8,000 to choose from', mobileCopy: '8,000 themes to choose from' },
			},
			ecommerce: { annually: {}, monthly: {} },
			domains: {
				annually: { copy: 'Free for the first year', mobileCopy: 'Free domain for the first year' },
				monthly: { notIncluded: true, copy: 'Included with annual plans' },
			},
			seo: {
				annually: { copy: 'Professional', mobileCopy: 'Professional SEO' },
				monthly: { copy: 'Professional', mobileCopy: 'Professional SEO' },
			},
			support: {
				annually: { copy: '24/7 priority live chat' },
				monthly: { copy: 'Email support' },
			},
			storage: {
				annually: { copy: '200GB storage' },
				monthly: { copy: '200GB storage' },
			},
		},
		eCommerce: {
			plugins: {
				annually: { copy: '58,000+ available', mobileCopy: '58,000+ plugins available' },
				monthly: { copy: '58,000+ available', mobileCopy: '58,000+ plugins available' },
			},
			themes: {
				annually: { copy: '8,000 to choose from', mobileCopy: '8,000 themes to choose from' },
				monthly: { copy: '8,000 to choose from', mobileCopy: '8,000 themes to choose from' },
			},
			ecommerce: {
				annually: { copy: 'Complete eCommerce platform' },
				monthly: { copy: 'Complete eCommerce platform' },
			},
			domains: {
				annually: { copy: 'Free for the first year', mobileCopy: 'Free domain for the first year' },
				monthly: { notIncluded: true, copy: 'Included with annual plans' },
			},
			seo: {
				annually: { copy: 'Professional', mobileCopy: 'Professional SEO' },
				monthly: { copy: 'Professional', mobileCopy: 'Professional SEO' },
			},
			support: {
				annually: { copy: '24/7 priority live chat' },
				monthly: { copy: 'Email support' },
			},
			storage: {
				annually: { copy: '200GB storage' },
				monthly: { copy: '200GB storage' },
			},
		},
	};
}

function getSharedFeatures() {
	const data = {
		Starter: [
			{ icon: 'pages', description: 'Spam protection' },
			{ icon: 'cloud', description: 'World-class managed hosting' },
			{ icon: 'lock', description: 'Free SSL certificante' },
			{ icon: 'image', description: '6GB of storage' },
			{ icon: 'image-remove', description: 'Ads removed' },
			{ icon: 'cart', description: 'Accept payments and donations' },
		],
		Professional: [
			{ icon: 'pages', description: 'Spam protection' },
			{ icon: 'cloud', description: 'World-class hosting' },
			{ icon: 'image-remove', description: 'Ads removed' },
			{ icon: 'play', description: 'Video hosting' },
			{ icon: 'cart', description: 'Accept payments and donations' },
			{ icon: 'star', description: 'Earn ad revenue' },
			{ icon: 'stats-alt', description: 'Google Analytics' },
			{ icon: 'mail', description: 'Email marketing integration' },
		],
	};

	return data;
}

const SharedFeatureHeader = styled.div`
	grid-column: 1 / 4;
	grid-row: 1;
	justify-self: stretch;
	margin: 25px 0;
	padding: 10px 24px;
	border-bottom: 1px solid rgba( 220, 220, 222, 0.5 );
	font-weight: 500;
	@media ( max-width: 660px ) {
		display: none;
	}
`;

const SharedFeature = styled.div`
	grid-area: ${ ( props ) => props.gridArea };
	padding: 5px 0;
	font-weight: 400;
	font-size: 14px;
	svg {
		vertical-align: middle;
		color: #c3c4c7;
	}
	svg + span {
		margin-left: 15px;
	}
	@media ( max-width: 660px ) {
		svg {
			display: none;
		}
		svg + span {
			margin-left: 0;
		}
	}
`;

const CtaButton = styled( Button )`
	grid-area: ${ ( props ) =>
		props.position ? `top-button-${ props.planOrder }` : `button-${ props.planOrder }` };
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
	@media ( max-width: 660px ) {
		display: ${ ( props ) => ( props.position ? 'none' : 'block' ) };
		height: 40px;
		margin: 24px 56px;
		font-size: 14px !important;
		padding: 0 !important;
	}
`;

const Feature = styled.div`
	grid-area: ${ ( props ) => props.gridArea };
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
	@media ( max-width: 660px ) {
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
	grid-area: ${ ( props ) => props.gridArea };
	justify-self: stretch;
	padding: 15px 36px 15px 0;
	border-bottom: ${ ( props ) => ( props.isLast ? '0' : '1px solid rgba( 220, 220, 222, 0.2 )' ) };
	align-self: center;
	font-weight: 500;
	text-align: end;
	font-size: 14px;
	letter-spacing: -0.16px;
	color: #2c3338;
	button {
		margin-left: 8px;
		font-size: 1em;
		vertical-align: middle;
	}
	@media ( max-width: 660px ) {
		display: none;
	}
`;

const Grid = styled.div`
	padding: 0 0 36px 0;
`;

const PlanHeader = styled.div`
	grid-area: ${ ( props ) => `plan-header-${ props.planOrder }` };
	padding: 24px 24px 0 24px;
	font-weight: normal;
	font-size: 18px;
	line-height: 24px;
	letter-spacing: 0.32px;
	color: #101517;
	p {
		font-size: 12px;
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
	@media ( max-width: 660px ) {
		padding: 56px 0 0 56px;
		span {
			margin-right: 60px;
		}
	}
`;

const PlanPrice = styled.div`
	grid-area: ${ ( props ) => `price-${ props.planOrder }` };
	padding: 0 24px;
	font-family: Recoleta;
	font-style: normal;
	font-weight: normal;
	font-size: 44px;
	letter-spacing: 2px;
	color: #000;
	@media ( max-width: 660px ) {
		padding-left: 56px;
	}
`;

const TermDescription = styled.div`
	grid-area: ${ ( props ) => `term-desc-${ props.planOrder }` };
	padding: 0 24px 24px 24px;
	font-size: 10px;
	color: #787c82;
	letter-spacing: -0.16px;
	@media ( max-width: 660px ) {
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
	order: ${ ( props ) => props.tabOrder };
	display: flex;
	margin: 0 auto;
	padding: 3px;
	margin-bottom: 35px;
	list-style: none;
	font-size: 14px;
	font-weight: 500;
	line-height: 20px;
	background-color: #f2f2f2;
	border-radius: 6px;
	color: #1d2327;
`;

const Tab = styled.li`
	padding: 6px 0;
	box-sizing: border-box;
	text-align: center;
	width: 150px;
	cursor: pointer;
	a {
		color: #1d2327;
	}
`;

const SelectedTab = styled( Tab )`
	background-color: #fff;
	border: 0.5px solid rgba( 0, 0, 0, 0.04 );
	box-shadow: 0px 3px 8px rgba( 0, 0, 0, 0.12 ), 0px 3px 1px rgba( 0, 0, 0, 0.04 );
	border-radius: 5px;
`;

const TermToggles = styled.div`
	grid-area: terms;
	padding-top: 24px;
	display: flex;
	flex-flow: column nowrap;
	justify-content: flex-start;
	@media ( max-width: 660px ) {
		padding-left: 24px;
	}
`;

const RadioButtonLabel = styled.label`
	display: flex;
	justify-content: flex-start;
	align-items: center;
	margin-bottom: 13px;
	cursor: pointer;
	font-size: 22px;
	span:last-child {
		order: 2;
		margin-left: 15px;
		font-weight: 500;
		font-size: 14px;
		letter-spacing: -0.16px;
		color: ${ ( props ) => ( props.isDisabled ? '#a8aaad' : '#2c3338' ) };
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
		background-color: ${ ( props ) => ( props.isDisabled ? '' : '#ccc' ) };
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
	&:after {
		content: '';
		display: none;
	}
`;

const PlanStyle = styled.div`
	grid-column: ${ ( props ) => parseInt( props.planOrder ) + 1 };
	grid-row: ${ ( props ) => `plan-header-${ props.planOrder } / button-${ props.planOrder }` };
	background: ${ ( props ) => ( props.featured ? 'rgba( 187, 224, 250, 0.3 )' : '' ) };
	border-radius: ${ ( props ) => ( props.featured ? '2px' : '0' ) };
	@media ( max-width: 660px ) {
		margin: 24px 24px 0 24px;
		grid-column: 1;
		grid-row: ${ ( props ) =>
			`plan-header-${ props.planOrder } / shared-features-${ props.planOrder }` };
		border-radius: 2px;
		background: ${ ( props ) => ( props.featured ? '#f1f5f8' : '#fff' ) };
		border: ${ ( props ) => ( props.featured ? '0' : '1px solid #dcdcde' ) };
	}
`;

const FreeBanner = styled.p`
	grid-area: free-banner;
	margin: 48px 0 24px 0;
	padding: 15px 0;
	text-align: center;
	font-size: 14px;
	background: rgba( 246, 247, 247, 0.5 );
	border-radius: 2px;
	& > button {
		font-size: 14px;
		color: #0675c4;
		cursor: pointer;
		text-decoration: underline;
	}
	@media ( max-width: 660px ) {
		margin: 24px 24px;
	}
`;
