import {
	applyTestFiltersToPlansList,
	FeatureGroup,
	getPlanClass,
	isWpcomEnterpriseGridPlan,
	isFreePlan,
	FEATURE_GROUP_GENERAL_FEATURES,
	getPlanFeaturesGrouped,
	PLAN_ENTERPRISE_GRID_WPCOM,
} from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import JetpackLogo from 'calypso/components/jetpack-logo';
import { getPlanFeaturesObject } from 'calypso/lib/plans/features-list';
import PlanTypeSelector, {
	PlanTypeSelectorProps,
} from 'calypso/my-sites/plans-features-main/plan-type-selector';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import PlanFeatures2023GridActions from './actions';
import PlanFeatures2023GridBillingTimeframe from './billing-timeframe';
import PlanFeatures2023GridHeaderPrice from './header-price';
import { PlanProperties } from './types';
const JetpackIconContainer = styled.div`
	padding-left: 6px;
`;

const PlanComparisonHeader = styled.h1`
	font-size: 2rem;
	text-align: center;
	margin: 48px 0;
`;

const Title = styled.div`
	font-weight: 500;
	font-size: 20px;
	margin-bottom: 15px;
`;

const Grid = styled.div`
	display: grid;
`;
const Row = styled.div`
	display: flex;
	justify-content: space-between;
	padding: 14px 0px;
	border-bottom: 1px solid #eee;
`;

const Cell = styled.div< { textAlign?: string } >`
	text-align: ${ ( props ) => props.textAlign ?? 'left' };
	width: 150px;
	display: flex;
	justify-content: space-between;
	flex-direction: column;
`;

const RowHead = styled.div`
	width: 300px;
	display: flex;
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
`;
type PlanComparisonGridProps = {
	planProperties?: Array< PlanProperties >;
	intervalType: string;
	planTypeSelectorProps: PlanTypeSelectorProps;
	isInSignup: boolean;
	isLaunchPage?: boolean;
	flowName: string;
};

export const PlanComparisonGrid: React.FC< PlanComparisonGridProps > = ( {
	planProperties,
	intervalType,
	planTypeSelectorProps,
	isInSignup,
	isLaunchPage,
	flowName,
} ) => {
	const translate = useTranslate();
	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const featureGroupMap = getPlanFeaturesGrouped();
	const displayedPlansProperties = ( planProperties ?? [] ).filter(
		( { planName } ) => ! ( planName === PLAN_ENTERPRISE_GRID_WPCOM )
	);
	const isMonthly = intervalType === 'monthly';
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

	return (
		<div className="plan-comparison-grid">
			<PlanComparisonHeader className="wp-brand-font">
				{ translate( 'Compare our plans and find yours' ) }
			</PlanComparisonHeader>
			<Grid>
				<Row key="feature-group-header-row" className="plan-comparison-grid__plan-row">
					<RowHead key="feature-name" className="plan-comparison-grid__interval-toggle">
						<PlanTypeSelector
							kind="interval"
							plans={ displayedPlansProperties.map( ( { planName } ) => planName ) }
							isInSignup={ planTypeSelectorProps.isInSignup }
							eligibleForWpcomMonthlyPlans={ planTypeSelectorProps.eligibleForWpcomMonthlyPlans }
							isPlansInsideStepper={ planTypeSelectorProps.isPlansInsideStepper }
							intervalType={ planTypeSelectorProps.intervalType }
							customerType={ planTypeSelectorProps.customerType }
							hidePersonalPlan={ planTypeSelectorProps.hidePersonalPlan }
							hideDiscountLabel={ true }
						/>
					</RowHead>
					{ displayedPlansProperties.map(
						( { planName, planConstantObj, ...planPropertiesObj } ) => {
							const headerClasses = classNames(
								'plan-comparison-grid__header',
								getPlanClass( planName )
							);

							const rawPrice = planPropertiesObj.rawPrice;
							const isLargeCurrency = rawPrice ? rawPrice > 99000 : false;

							return (
								<Cell key={ planName } className={ headerClasses } textAlign="left">
									<header>
										<h4 className="plan-features-2023-grid__header-title">
											{ planConstantObj.getTitle() }
										</h4>
									</header>
									{ rawPrice && (
										<PlanFeatures2023GridHeaderPrice
											currencyCode={ currencyCode }
											discountPrice={ planPropertiesObj.discountPrice }
											rawPrice={ rawPrice }
											planName={ planName }
											is2023OnboardingPricingGrid={ true }
											isLargeCurrency={ isLargeCurrency }
										/>
									) }
									<PlanFeatures2023GridBillingTimeframe
										rawPrice={ rawPrice }
										rawPriceAnnual={ planPropertiesObj.rawPriceAnnual }
										currencyCode={ currencyCode }
										annualPricePerMonth={ planPropertiesObj.annualPricePerMonth }
										isMonthlyPlan={ planPropertiesObj.isMonthlyPlan }
										planName={ planName }
										translate={ translate }
										billingTimeframe={ planConstantObj.getBillingTimeFrame() }
									/>
									<PlanFeatures2023GridActions
										className={ getPlanClass( planName ) }
										freePlan={ isFreePlan( planName ) }
										isWpcomEnterpriseGridPlan={ isWpcomEnterpriseGridPlan( planName ) }
										isPlaceholder={ planPropertiesObj.isPlaceholder }
										isInSignup={ isInSignup }
										isLaunchPage={ isLaunchPage }
										planName={ planConstantObj.getTitle() }
										planType={ planName }
										flowName={ flowName }
									/>
								</Cell>
							);
						}
					) }
				</Row>

				{ Object.values( featureGroupMap ).map( ( featureGroup: FeatureGroup ) => {
					const features = featureGroup.get2023PricingGridSignupWpcomFeatures();
					const featureObjects = getPlanFeaturesObject( features );
					return (
						<div key={ `feature-group-title-${ featureGroup.slug }` }>
							<Row
								key={ `feature-group-title-${ featureGroup.slug }` }
								className="plan-comparison-grid__group-title-row"
							>
								<Title className={ `plan-comparison-grid__group-${ featureGroup.slug }` }>
									{ featureGroup.getTitle() }
								</Title>
							</Row>
							{ featureObjects.map( ( feature ) => {
								const featureSlug = feature.getSlug();
								return (
									<Row
										key={ featureSlug }
										className={ `plan-comparison-grid__feature-row ${ feature.getTitle() }` }
									>
										<RowHead
											key="feature-name"
											className={ `plan-comparison-grid__feature-feature-name ${ feature.getTitle() }` }
										>
											{ feature.getTitle() }
											{ allJetpackFeatures.has( feature.getSlug() ) ? (
												<JetpackIconContainer>
													<JetpackLogo size={ 16 } />
												</JetpackIconContainer>
											) : null }
										</RowHead>
										{ ( displayedPlansProperties ?? [] ).map( ( { planName } ) =>
											restructuredFeatures.featureMap[ planName ].has( featureSlug ) ? (
												<Cell
													key={ planName }
													className={ `plan-comparison-grid__plan ${ planName }` }
													textAlign="center"
												>
													<Gridicon icon="checkmark" color="#0675C4" />
												</Cell>
											) : (
												<Cell
													key={ planName }
													className={ `plan-comparison-grid__plan ${ planName }` }
													textAlign="center"
												>
													<Gridicon icon="minus-small" />
												</Cell>
											)
										) }
									</Row>
								);
							} ) }
							{ featureGroup.slug === FEATURE_GROUP_GENERAL_FEATURES ? (
								<Row key="feature-storage" className="plan-comparison-grid__feature-storage">
									<RowHead
										key="feature-name"
										className="plan-comparison-grid__feature-feature-name storage"
									>
										{ translate( 'Storage' ) }
									</RowHead>
									{ ( displayedPlansProperties ?? [] ).map( ( { planName } ) => {
										const storageFeature = restructuredFeatures.planStorageOptionsMap[ planName ];
										const [ featureObject ] = getPlanFeaturesObject( [ storageFeature ] );

										return (
											<Cell
												key={ planName }
												className={ `plan-comparison-grid__plan ${ planName }` }
												textAlign="center"
											>
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
			</Grid>
		</div>
	);
};
