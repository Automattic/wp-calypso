import {
	applyTestFiltersToPlansList,
	FeatureGroup,
	getPlanFeaturesGrouped,
	PLAN_ENTERPRISE_GRID_WPCOM,
} from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { getPlanFeaturesObject } from 'calypso/lib/plans/features-list';
import { IntervalTypeToggle } from 'calypso/my-sites/plans-features-main/plan-type-selector';
import { PlanProperties } from './types';

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
	.plan-comparison-grid__feature-feature-name {
		width: 250px;
	}
`;

const Cell = styled.div< { textAlign?: string } >`
	text-align: ${ ( props ) => props.textAlign ?? 'left' };
`;

type FeatureAvailabilityForPlansProps = {
	displayedPlans?: Array< PlanProperties >;
	featureSlug: string;
	planFeatureMap: Record< string, Set< string > >;
};

const FeatureAvailabilityForPlans: React.FC< FeatureAvailabilityForPlansProps > = ( {
	displayedPlans,
	featureSlug,
	planFeatureMap,
} ) => {
	return (
		<>
			{ ( displayedPlans ?? [] ).map( ( { planName } ) => {
				if ( planFeatureMap[ planName ].has( featureSlug ) ) {
					return (
						<Cell
							key={ planName }
							className={ `plan-comparison-grid__plan ${ planName }` }
							textAlign="center"
						>
							<Gridicon icon="checkmark" color="#0675C4" />
						</Cell>
					);
				}
				return (
					<Cell
						key={ planName }
						className={ `plan-comparison-grid__plan ${ planName }` }
						textAlign="center"
					>
						<Gridicon icon="minus-small" />
					</Cell>
				);
			} ) }
		</>
	);
};

type PlanComparisonGridProps = {
	planProperties?: Array< PlanProperties >;
	intervalType: string;
};

export const PlanComparisonGrid: React.FC< PlanComparisonGridProps > = ( {
	planProperties,
	intervalType,
} ) => {
	const translate = useTranslate();
	const planGroups = getPlanFeaturesGrouped();
	const displayedPlansProperties = ( planProperties ?? [] ).filter(
		( { planName } ) => ! ( planName === PLAN_ENTERPRISE_GRID_WPCOM )
	);
	const isMonthly = intervalType === 'monthly';
	const planFeatureMap = useMemo( () => {
		let previousPlan = null;
		const featureMap: Record< string, Set< string > > = {};

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
			featureMap[ planName ] = new Set( featuresAvailable );

			// Add previous plan feature
			if ( previousPlan !== null ) {
				featureMap[ planName ] = new Set( [
					...featureMap[ planName ],
					...featureMap[ previousPlan ],
				] );
			}
			previousPlan = planName;
		}
		return featureMap;
	}, [ planProperties, isMonthly ] );

	return (
		<div className="plan-comparison-grid">
			<PlanComparisonHeader className="wp-brand-font">
				{ translate( 'Compare our plans and find yours' ) }
			</PlanComparisonHeader>
			<Grid>
				<Row key="feature-group-title" className="plan-comparison-grid__plan-row">
					<Cell key="feature-name" className="plan-comparison-grid__interval-toggle">
						<BrowserRouter>
							<IntervalTypeToggle
								eligibleForWpcomMonthlyPlans={ true }
								intervalType={ intervalType }
								plans={ [] }
								isInSignup={ true }
								isPlansInsideStepper={ true }
							/>
						</BrowserRouter>
					</Cell>
					{ displayedPlansProperties.map( ( { planName, planConstantObj } ) => (
						<Cell key={ planName } className="plan-comparison-grid__plan-title" textAlign="center">
							{ planConstantObj.getTitle() }
						</Cell>
					) ) }
				</Row>

				{ Object.values( planGroups ).map( ( featureGroup: FeatureGroup ) => {
					const features = featureGroup.get2023PricingGridSignupWpcomFeatures();
					const featureObjects = getPlanFeaturesObject( features );
					return (
						<>
							<Row key="feature-group-title" className="plan-comparison-grid__group-title-row">
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
										<Cell
											key="feature-name"
											className={ `plan-comparison-grid__feature-feature-name ${ feature.getTitle() }` }
										>
											{ feature.getTitle() }
										</Cell>
										<FeatureAvailabilityForPlans
											displayedPlans={ displayedPlansProperties }
											featureSlug={ featureSlug }
											planFeatureMap={ planFeatureMap }
										/>
									</Row>
								);
							} ) }
						</>
					);
				} ) }
			</Grid>
		</div>
	);
};
