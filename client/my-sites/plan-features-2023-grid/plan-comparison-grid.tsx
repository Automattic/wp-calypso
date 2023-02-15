import {
	applyTestFiltersToPlansList,
	FeatureGroup,
	getPlanClass,
	isWpcomEnterpriseGridPlan,
	isFreePlan,
	isBusinessPlan,
	FEATURE_GROUP_ESSENTIAL_FEATURES,
	getPlanFeaturesGrouped,
	PLAN_ENTERPRISE_GRID_WPCOM,
} from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState, useCallback, useEffect, ChangeEvent } from 'react';
import { useSelector } from 'react-redux';
import JetpackLogo from 'calypso/components/jetpack-logo';
import PlanPill from 'calypso/components/plans/plan-pill';
import { getPlanFeaturesObject } from 'calypso/lib/plans/features-list';
import PlanTypeSelector, {
	PlanTypeSelectorProps,
} from 'calypso/my-sites/plans-features-main/plan-type-selector';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import PlanFeatures2023GridActions from './actions';
import PlanFeatures2023GridBillingTimeframe from './billing-timeframe';
import PlanFeatures2023GridHeaderPrice from './header-price';
import { plansBreakSmall, plansBreakLarge } from './media-queries';
import { Plans2023Tooltip } from './plans-2023-tooltip';
import { PlanProperties } from './types';
import { usePricingBreakpoint } from './util';

function DropdownIcon() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" width="26" height="24" fill="none" viewBox="0 -5 26 24">
			<path
				fill="#0675C4"
				fillRule="evenodd"
				d="M18 10.5L13 15l-5-4.5L9.224 9 13 12.399 16.776 9 18 10.5z"
				clipRule="evenodd"
			></path>
		</svg>
	);
}

const JetpackIconContainer = styled.div`
	padding-left: 6px;
	display: inline-block;
	vertical-align: middle;
	line-height: 1;
`;

const PlanComparisonHeader = styled.h1`
	.plans .step-container .step-container__content &&,
	&& {
		font-size: 2rem;
		text-align: center;
		margin: 48px 0;
	}
`;

const Title = styled.div< { isHiddenInMobile?: boolean } >`
	font-weight: 500;
	font-size: 20px;
	padding: 14px;
	flex: 1;
	display: flex;
	align-items: center;
	column-gap: 5px;
	border: solid 1px #e0e0e0;
	border-left: none;
	border-right: none;

	.gridicon {
		transform: ${ ( props ) =>
			props.isHiddenInMobile ? 'rotateZ( 180deg )' : 'rotateZ( 0deg )' };
	}

	${ plansBreakSmall( css`
		padding-left: 0;
		border: none;
		padding: 0;

		.gridicon {
			display: none;
		}
	` ) }
`;

const Grid = styled.div< { isInSignup: boolean } >`
	display: grid;
	margin-top: ${ ( props ) => ( props.isInSignup ? '90px' : '64px' ) };
	background: #fff;
	border: solid 1px #e0e0e0;

	@media ( min-width: 385px ) {
		border-radius: 5px;
	}
`;
const Row = styled.div< { isHiddenInMobile?: boolean } >`
	justify-content: space-between;
	margin-bottom: -1px;
	align-items: stretch;
	display: ${ ( props ) => ( props.isHiddenInMobile ? 'none' : 'flex' ) };

	${ plansBreakSmall( css`
		display: flex;
		margin: 0 20px;
		padding: 12px 0;
		border-bottom: 1px solid #eee;
	` ) }
`;

const PlanRow = styled( Row )`
	&:last-of-type {
		display: none;
	}

	${ plansBreakSmall( css`
		border-bottom: none;

		&:last-of-type {
			display: flex;
			padding-top: 0;
			padding-bottom: 0;
		}
	` ) }
`;

const TitleRow = styled( Row )`
	cursor: pointer;
	display: flex;

	${ plansBreakSmall( css`
		cursor: default;
		border-bottom: none;
		padding: 20px 0 10px;
		pointer-events: none;
	` ) }
`;

const Cell = styled.div< { textAlign?: string; isInSignup: boolean } >`
	text-align: ${ ( props ) => props.textAlign ?? 'left' };
	display: flex;
	flex: 1;
	justify-content: space-between;
	flex-direction: column;
	align-items: center;
	padding: 33px 20px 0;
	border-right: solid 1px #e0e0e0;

	.gridicon {
		fill: currentColor;
	}

	img {
		max-width: 100%;
	}

	&.title-is-subtitle {
		padding-top: 0;
	}

	&:last-of-type {
		border-right: none;
	}

	${ Row }:last-of-type & {
		padding-bottom: 24px;

		${ plansBreakSmall( css`
			padding-bottom: 0px;
		` ) }
	}

	${ plansBreakSmall( css`
		padding: 0 14px;
		min-width: 180px;
		border-right: none;

		&:first-of-type {
			padding-left: 0;
		}
		&:last-of-type {
			padding-right: 0;
			border-right: none;
		}
	` ) }

	${ ( props ) =>
		props.isInSignup
			? plansBreakSmall(
					css`
						max-width: 180px;
					`
			  )
			: plansBreakSmall(
					css`
						max-width: 160px;
					`
			  ) }

	${ plansBreakLarge( css`
		max-width: 200px;
	` ) }
`;

const RowHead = styled.div`
	display: none;
	font-size: 14px;
	${ plansBreakSmall( css`
		display: block;
		flex: 1;
	` ) }
`;

const PlanSelector = styled.header`
	position: relative;

	.plan-comparison-grid__title {
		.gridicon {
			margin-left: 6px;
		}
	}

	.plan-comparison-grid__title-select {
		appearance: none;
		-moz-appearance: none;
		-webkit-appearance: none;
		background: 0 0;
		border: none;
		font-size: inherit;
		color: inherit;
		font-family: inherit;
		opacity: 0;
		width: 100%;
		position: absolute;
		top: 0;
		left: 0;
		cursor: pointer;
		height: 30px;

		&:focus ~ .plan-comparison-grid__title {
			outline: thin dotted;
		}
	}
`;

const StorageButton = styled.div`
	background: #f2f2f2;
	border-radius: 5px;
	padding: 4px 0;
	width: -moz-fit-content;
	width: fit-content;
	text-align: center;
	font-size: 0.75rem;
	font-weight: 400;
	line-height: 20px;
	color: var( --studio-gray-90 );
	min-width: 64px;
	margin-top: 10px;

	${ plansBreakSmall( css`
		margin-top: 0;
	` ) }
`;
type PlanComparisonGridProps = {
	planProperties?: Array< PlanProperties >;
	intervalType: string;
	planTypeSelectorProps: PlanTypeSelectorProps;
	isInSignup: boolean;
	isLaunchPage?: boolean;
	flowName: string;
	currentSitePlanSlug: string;
	manageHref: string;
	canUserPurchasePlan: boolean;
	selectedSiteSlug: string | null;
	onUpgradeClick: ( properties: PlanProperties ) => void;
};
type PlanComparisonGridHeaderProps = {
	displayedPlansProperties: Array< PlanProperties >;
	visiblePlansProperties: Array< PlanProperties >;
	isInSignup: boolean;
	isLaunchPage?: boolean;
	isFooter?: boolean;
	flowName: string;
	onPlanChange: ( currentPlan: string, event: ChangeEvent ) => void;
	currentSitePlanSlug: string;
	manageHref: string;
	canUserPurchasePlan: boolean;
	selectedSiteSlug: string | null;
	onUpgradeClick: ( properties: PlanProperties ) => void;
};

const PlanComparisonGridHeader: React.FC< PlanComparisonGridHeaderProps > = ( {
	displayedPlansProperties,
	visiblePlansProperties,
	isInSignup,
	isLaunchPage,
	flowName,
	isFooter,
	onPlanChange,
	currentSitePlanSlug,
	manageHref,
	canUserPurchasePlan,
	selectedSiteSlug,
	onUpgradeClick,
} ) => {
	const translate = useTranslate();
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const allVisible = visiblePlansProperties.length === displayedPlansProperties.length;
	return (
		<PlanRow>
			<RowHead
				key="feature-name"
				className="plan-comparison-grid__header plan-comparison-grid__interval-toggle"
			/>
			{ visiblePlansProperties.map( ( planProperties ) => {
				const { planName, planConstantObj, availableForPurchase, current, ...planPropertiesObj } =
					planProperties;
				const headerClasses = classNames(
					'plan-comparison-grid__header',
					getPlanClass( planName ),
					{
						'popular-plan-parent-class': isBusinessPlan( planName ),
						'plan-is-footer': isFooter,
					}
				);

				const rawPrice = planPropertiesObj.rawPrice;
				const isLargeCurrency = rawPrice ? rawPrice > 99000 : false;

				const showPlanSelect = ! allVisible && ! current;

				return (
					<Cell
						key={ planName }
						isInSignup={ isInSignup }
						className={ headerClasses }
						textAlign="left"
					>
						{ isBusinessPlan( planName ) && (
							<div className="plan-features-2023-grid__popular-badge">
								<PlanPill isInSignup={ isInSignup }>{ translate( 'Popular' ) }</PlanPill>
							</div>
						) }
						<PlanSelector>
							{ showPlanSelect && (
								<select
									onChange={ ( event: ChangeEvent ) => onPlanChange( planName, event ) }
									className="plan-comparison-grid__title-select"
									value={ planName }
								>
									{ displayedPlansProperties.map( ( { planName: otherPlan, planConstantObj } ) => {
										const isVisiblePlan = visiblePlansProperties.find(
											( { planName } ) => planName === otherPlan
										);

										if ( isVisiblePlan && otherPlan !== planName ) {
											return null;
										}

										return (
											<option key={ otherPlan } value={ otherPlan }>
												{ planConstantObj.getTitle() }
											</option>
										);
									} ) }
								</select>
							) }
							<h4 className="plan-comparison-grid__title">
								<span>{ planConstantObj.getTitle() }</span>
								{ showPlanSelect && <DropdownIcon /> }
							</h4>
						</PlanSelector>
						<PlanFeatures2023GridHeaderPrice
							currencyCode={ currencyCode }
							discountPrice={ planPropertiesObj.discountPrice }
							rawPrice={ rawPrice || 0 }
							planName={ planName }
							is2023OnboardingPricingGrid={ true }
							isLargeCurrency={ isLargeCurrency }
						/>
						<div className="plan-comparison-grid__billing-info">
							<PlanFeatures2023GridBillingTimeframe
								rawPrice={ rawPrice }
								rawPriceAnnual={ planPropertiesObj.rawPriceAnnual }
								currencyCode={ planPropertiesObj.currencyCode }
								annualPricePerMonth={ planPropertiesObj.annualPricePerMonth }
								isMonthlyPlan={ planPropertiesObj.isMonthlyPlan }
								translate={ translate }
								billingTimeframe={ planConstantObj.getBillingTimeFrame() }
							/>
						</div>
						<PlanFeatures2023GridActions
							currentSitePlanSlug={ currentSitePlanSlug }
							manageHref={ manageHref }
							canUserPurchasePlan={ canUserPurchasePlan }
							current={ current ?? false }
							availableForPurchase={ availableForPurchase }
							className={ getPlanClass( planName ) }
							freePlan={ isFreePlan( planName ) }
							isWpcomEnterpriseGridPlan={ isWpcomEnterpriseGridPlan( planName ) }
							isPlaceholder={ planPropertiesObj.isPlaceholder }
							isInSignup={ isInSignup }
							isLaunchPage={ isLaunchPage }
							planName={ planConstantObj.getTitle() }
							planType={ planName }
							flowName={ flowName }
							selectedSiteSlug={ selectedSiteSlug }
							onUpgradeClick={ () => onUpgradeClick( planProperties ) }
						/>
					</Cell>
				);
			} ) }
		</PlanRow>
	);
};

export const PlanComparisonGrid: React.FC< PlanComparisonGridProps > = ( {
	planProperties,
	intervalType,
	planTypeSelectorProps,
	isInSignup,
	isLaunchPage,
	flowName,
	currentSitePlanSlug,
	manageHref,
	canUserPurchasePlan,
	selectedSiteSlug,
	onUpgradeClick,
} ) => {
	const translate = useTranslate();
	const featureGroupMap = getPlanFeaturesGrouped();
	const displayedPlansProperties = useMemo(
		() =>
			( planProperties ?? [] ).filter(
				( { planName } ) => ! ( planName === PLAN_ENTERPRISE_GRID_WPCOM )
			),
		[ planProperties ]
	);
	const isMonthly = intervalType === 'monthly';
	const isLargestBreakpoint = usePricingBreakpoint( 1772 ); // 1500px + 272px (sidebar)
	const isLargeBreakpoint = usePricingBreakpoint( 1612 ); // 1340px + 272px (sidebar)
	const isMediumBreakpoint = usePricingBreakpoint( 1340 ); // keeping original breakpoint to match Plan Grid

	const [ visiblePlans, setVisiblePlans ] = useState< string[] >( [] );
	const [ firstSetOfFeatures ] = Object.keys( featureGroupMap );
	const [ visibleFeatureGroups, setVisibleFeatureGroups ] = useState< string[] >( [
		firstSetOfFeatures,
	] );

	useEffect( () => {
		let newVisiblePlans = displayedPlansProperties.map( ( { planName } ) => planName );

		let visibleLength = newVisiblePlans.length;
		if ( ! isInSignup ) {
			visibleLength = isLargestBreakpoint ? 4 : visibleLength;
			visibleLength = isLargeBreakpoint ? 3 : visibleLength;
		}

		visibleLength = isMediumBreakpoint ? 2 : visibleLength;

		if ( newVisiblePlans.length !== visibleLength ) {
			// ensures current plan is first in the list
			newVisiblePlans.sort( ( visiblePlan ) => ( visiblePlan === currentSitePlanSlug ? -1 : 1 ) );
			newVisiblePlans = newVisiblePlans.slice( 0, visibleLength );
		}

		setVisiblePlans( newVisiblePlans );
	}, [
		isLargestBreakpoint,
		isLargeBreakpoint,
		isMediumBreakpoint,
		intervalType,
		displayedPlansProperties,
		isInSignup,
		currentSitePlanSlug,
	] );

	const restructuredFeatures = useMemo( () => {
		let previousPlan = null;
		const planFeatureMap: Record< string, Set< string > > = {};
		const planStorageOptionsMap: Record< string, string > = {};

		for ( const plan of planProperties ?? [] ) {
			const { planName } = plan;
			const planObject = applyTestFiltersToPlansList( planName, undefined );
			const wpcomFeatures = planObject.get2023PricingGridSignupWpcomFeatures?.() ?? [];
			const jetpackFeatures = planObject.get2023PricingGridSignupJetpackFeatures?.() ?? [];
			const annualOnlyFeatures = planObject.getAnnualPlansOnlyFeatures?.() ?? [];

			let featuresAvailable = [ ...wpcomFeatures, ...jetpackFeatures ];
			if ( isMonthly ) {
				// Filter out features only available annually
				featuresAvailable = featuresAvailable.filter(
					( feature ) => ! annualOnlyFeatures.includes( feature )
				);
			}
			planFeatureMap[ planName ] = new Set( featuresAvailable );

			// Add previous plan feature
			if ( previousPlan !== null ) {
				planFeatureMap[ planName ] = new Set( [
					...planFeatureMap[ planName ],
					...planFeatureMap[ previousPlan ],
				] );
			}
			previousPlan = planName;
			const [ storageOption ] = planObject.get2023PricingGridSignupStorageOptions?.() ?? [];
			planStorageOptionsMap[ planName ] = storageOption;
		}
		return { featureMap: planFeatureMap, planStorageOptionsMap };
	}, [ planProperties, isMonthly ] );

	const allJetpackFeatures = useMemo( () => {
		const jetpackFeatures = new Set(
			( planProperties ?? [] )
				.map( ( plan ) => {
					const { planName } = plan;
					const planObject = applyTestFiltersToPlansList( planName, undefined );
					const jetpackFeatures = planObject.get2023PricingGridSignupJetpackFeatures?.() ?? [];
					return jetpackFeatures;
				} )
				.flat()
		);

		return jetpackFeatures;
	}, [ planProperties ] );

	const onPlanChange = useCallback(
		( currentPlan, event ) => {
			const newPlan = event.currentTarget.value;

			const newVisiblePlans = visiblePlans.map( ( plan ) =>
				plan === currentPlan ? newPlan : plan
			);
			setVisiblePlans( newVisiblePlans );
		},
		[ visiblePlans ]
	);

	const toggleFeatureGroup = ( featureGroupSlug: string ) => {
		const index = visibleFeatureGroups.indexOf( featureGroupSlug );
		const newVisibleFeatureGroups = [ ...visibleFeatureGroups ];
		if ( index === -1 ) {
			newVisibleFeatureGroups.push( featureGroupSlug );
		} else {
			newVisibleFeatureGroups.splice( index, 1 );
		}

		setVisibleFeatureGroups( newVisibleFeatureGroups );
	};
	const visiblePlansProperties = visiblePlans.reduce< PlanProperties[] >( ( acc, planName ) => {
		const plan = displayedPlansProperties.find( ( plan ) => plan.planName === planName );
		if ( plan ) {
			acc.push( plan );
		}
		return acc;
	}, [] );

	return (
		<div className="plan-comparison-grid">
			<PlanComparisonHeader className="wp-brand-font">
				{ translate( 'Compare our plans and find yours' ) }
			</PlanComparisonHeader>
			<PlanTypeSelector
				kind="interval"
				plans={ displayedPlansProperties.map( ( { planName } ) => planName ) }
				isInSignup={ planTypeSelectorProps.isInSignup }
				eligibleForWpcomMonthlyPlans={ planTypeSelectorProps.eligibleForWpcomMonthlyPlans }
				isPlansInsideStepper={ planTypeSelectorProps.isPlansInsideStepper }
				intervalType={ planTypeSelectorProps.intervalType }
				customerType={ planTypeSelectorProps.customerType }
				hidePersonalPlan={ planTypeSelectorProps.hidePersonalPlan }
				basePlansPath={ planTypeSelectorProps.basePlansPath }
				siteSlug={ planTypeSelectorProps.siteSlug }
				hideDiscountLabel={ true }
			/>
			<Grid isInSignup={ isInSignup }>
				<PlanComparisonGridHeader
					displayedPlansProperties={ displayedPlansProperties }
					visiblePlansProperties={ visiblePlansProperties }
					isInSignup={ isInSignup }
					isLaunchPage={ isLaunchPage }
					flowName={ flowName }
					onPlanChange={ onPlanChange }
					currentSitePlanSlug={ currentSitePlanSlug }
					manageHref={ manageHref }
					canUserPurchasePlan={ canUserPurchasePlan }
					selectedSiteSlug={ selectedSiteSlug }
					onUpgradeClick={ onUpgradeClick }
				/>
				{ Object.values( featureGroupMap ).map( ( featureGroup: FeatureGroup ) => {
					const features = featureGroup.get2023PricingGridSignupWpcomFeatures();
					const featureObjects = getPlanFeaturesObject( features );

					const featureGroupClass = `feature-group-title-${ featureGroup.slug }`;
					const isHiddenInMobile = ! visibleFeatureGroups.includes( featureGroup.slug );
					return (
						<div key={ featureGroupClass } className={ featureGroup.slug }>
							<TitleRow
								className="plan-comparison-grid__group-title-row"
								onClick={ () => toggleFeatureGroup( featureGroup.slug ) }
							>
								<Title
									isHiddenInMobile={ isHiddenInMobile }
									className={ `plan-comparison-grid__group-${ featureGroup.slug }` }
								>
									<Gridicon icon="chevron-up" size={ 12 } color="#1E1E1E" />
									{ featureGroup.getTitle() }
								</Title>
							</TitleRow>
							{ featureObjects.map( ( feature ) => {
								const featureSlug = feature.getSlug();
								return (
									<Row
										key={ featureSlug }
										isHiddenInMobile={ isHiddenInMobile }
										className="plan-comparison-grid__feature-row"
									>
										<RowHead
											key="feature-name"
											className="plan-comparison-grid__feature-feature-name"
										>
											<Plans2023Tooltip text={ feature.getDescription?.() }>
												{ feature.getTitle() }
											</Plans2023Tooltip>
											{ allJetpackFeatures.has( feature.getSlug() ) ? (
												<JetpackIconContainer>
													<JetpackLogo size={ 16 } />
												</JetpackIconContainer>
											) : null }
										</RowHead>
										{ ( visiblePlansProperties ?? [] ).map( ( { planName } ) => {
											const hasFeature =
												restructuredFeatures.featureMap[ planName ].has( featureSlug );
											const cellClasses = classNames(
												'plan-comparison-grid__plan',
												getPlanClass( planName ),
												{
													'popular-plan-parent-class': isBusinessPlan( planName ),
													'has-feature': hasFeature,
													'title-is-subtitle': 'live-chat-support' === featureSlug,
												}
											);

											return (
												<Cell
													key={ planName }
													isInSignup={ isInSignup }
													className={ cellClasses }
													textAlign="center"
												>
													{ feature.getIcon && (
														<span className="plan-comparison-grid__plan-image">
															{ feature.getIcon() }
														</span>
													) }
													<span className="plan-comparison-grid__plan-title">
														{ feature.getAlternativeTitle?.() || feature.getTitle() }
													</span>
													{ feature.getCompareTitle && (
														<span className="plan-comparison-grid__plan-subtitle">
															{ feature.getCompareTitle() }
														</span>
													) }
													{ hasFeature ? (
														<Gridicon icon="checkmark" color="#0675C4" size={ 18 } />
													) : (
														<Gridicon icon="minus-small" color="#C3C4C7" />
													) }
												</Cell>
											);
										} ) }
									</Row>
								);
							} ) }
							{ featureGroup.slug === FEATURE_GROUP_ESSENTIAL_FEATURES ? (
								<Row
									key="feature-storage"
									isHiddenInMobile={ isHiddenInMobile }
									className="plan-comparison-grid__feature-storage"
								>
									<RowHead
										key="feature-name"
										className="plan-comparison-grid__feature-feature-name storage"
									>
										<Plans2023Tooltip
											text={ translate( 'Space to store your photos, media, and more.' ) }
										>
											{ translate( 'Storage' ) }
										</Plans2023Tooltip>
									</RowHead>
									{ ( visiblePlansProperties ?? [] ).map( ( { planName } ) => {
										const storageFeature = restructuredFeatures.planStorageOptionsMap[ planName ];
										const [ featureObject ] = getPlanFeaturesObject( [ storageFeature ] );
										const cellClasses = classNames(
											'plan-comparison-grid__plan',
											'has-feature',
											getPlanClass( planName ),
											{
												'popular-plan-parent-class': isBusinessPlan( planName ),
											}
										);

										return (
											<Cell
												key={ planName }
												isInSignup={ isInSignup }
												className={ cellClasses }
												textAlign="center"
											>
												<span className="plan-comparison-grid__plan-title">
													{ translate( 'Storage' ) }
												</span>
												<StorageButton
													className="plan-features-2023-grid__storage-button"
													key={ planName }
												>
													{ featureObject.getCompareTitle?.() }
												</StorageButton>
											</Cell>
										);
									} ) }
								</Row>
							) : null }
						</div>
					);
				} ) }
				<PlanComparisonGridHeader
					displayedPlansProperties={ displayedPlansProperties }
					visiblePlansProperties={ visiblePlansProperties }
					isInSignup={ isInSignup }
					isLaunchPage={ isLaunchPage }
					flowName={ flowName }
					isFooter={ true }
					onPlanChange={ onPlanChange }
					currentSitePlanSlug={ currentSitePlanSlug }
					manageHref={ manageHref }
					canUserPurchasePlan={ canUserPurchasePlan }
					selectedSiteSlug={ selectedSiteSlug }
					onUpgradeClick={ onUpgradeClick }
				/>
			</Grid>
		</div>
	);
};
