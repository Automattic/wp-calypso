import { type FeatureGroupSlug, isWpcomEnterpriseGridPlan } from '@automattic/calypso-products';
import { JetpackLogo } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { usePlansGridContext } from '../../grid-context';
import { useManageTooltipToggle } from '../../hooks/use-manage-tooltip-toggle';
import PlanFeatures2023GridFeatures from '../features';
import { PlanFeaturesItem } from '../item';
import PlanDivOrTdContainer from '../plan-div-td-container';
import { Plans2023Tooltip } from '../plans-2023-tooltip';
import type { DataResponse, GridPlan } from '../../types';

type PlanFeaturesListProps = {
	/**
	 * Used to show a wpcom free domain in the Free plan column when a paid domain is picked.
	 */
	generatedWPComSubdomain: DataResponse< { domain_name: string } >;
	/**
	 * Used to hide features that are not available, instead of strike-through as explained in #76206
	 */
	hideUnavailableFeatures?: boolean;
	/**
	 * Indicates when a custom domain is allowed to be used with the Free plan.
	 */
	isCustomDomainAllowedOnFreePlan: boolean;
	paidDomainName?: string;
	renderedGridPlans: GridPlan[];
	selectedFeature?: string;
	options?: {
		isTableCell?: boolean;
	};
	featureGroupSlug?: FeatureGroupSlug;
};

const PlanFeaturesList = ( {
	generatedWPComSubdomain,
	hideUnavailableFeatures,
	isCustomDomainAllowedOnFreePlan,
	options,
	paidDomainName,
	renderedGridPlans,
	selectedFeature,
	featureGroupSlug,
}: PlanFeaturesListProps ) => {
	const [ activeTooltipId, setActiveTooltipId ] = useManageTooltipToggle();
	const translate = useTranslate();
	const { featureGroupMap } = usePlansGridContext();
	const featureGroup = featureGroupSlug && featureGroupMap[ featureGroupSlug ];

	/**
	 * This is a pretty critical and fragile, as it filters out the enterprise plan.
	 * If the plan sits anywhere else but the tail/end, it will most likely break the grid (render wrong parts at wrong places).
	 */
	const plansWithFeatures = useMemo( () => {
		return renderedGridPlans.filter(
			( gridPlan ) => ! isWpcomEnterpriseGridPlan( gridPlan.planSlug )
		);
	}, [ renderedGridPlans ] );

	return plansWithFeatures.map(
		( { planSlug, features: { wpcomFeatures, jetpackFeatures } }, mapIndex ) => {
			const filteredWpcomFeatures = wpcomFeatures.filter(
				( feature ) =>
					featureGroup?.get2023PricingGridSignupWpcomFeatures().includes( feature.getSlug() )
			);

			if ( featureGroup && ! filteredWpcomFeatures.length ) {
				if ( options?.isTableCell ) {
					// Render a placeholder to keep the grid aligned
					return (
						<PlanDivOrTdContainer
							key={ `${ planSlug }-${ mapIndex }` }
							isTableCell
							className="plan-features-2023-grid__table-item"
						/>
					);
				}
				// No placeholder required if the element is not a part of the table.
				return;
			}

			return (
				<PlanDivOrTdContainer
					key={ `${ planSlug }-${ mapIndex }` }
					isTableCell={ options?.isTableCell }
					className="plan-features-2023-grid__table-item"
				>
					{ featureGroup && (
						<PlanFeaturesItem>
							<h2 className="plans-grid-next-features-grid__feature-group-title">
								{ featureGroup?.getTitle() }
							</h2>
						</PlanFeaturesItem>
					) }
					<PlanFeatures2023GridFeatures
						features={ featureGroup ? filteredWpcomFeatures : wpcomFeatures }
						planSlug={ planSlug }
						paidDomainName={ paidDomainName }
						generatedWPComSubdomain={ generatedWPComSubdomain }
						hideUnavailableFeatures={ hideUnavailableFeatures }
						selectedFeature={ selectedFeature }
						isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
						setActiveTooltipId={ setActiveTooltipId }
						activeTooltipId={ activeTooltipId }
					/>
					{ ! featureGroup && jetpackFeatures.length !== 0 && (
						<>
							<div className="plan-features-2023-grid__jp-logo" key="jp-logo">
								<Plans2023Tooltip
									text={ translate(
										'Security, performance, and growth tools—powered by Jetpack.'
									) }
									setActiveTooltipId={ setActiveTooltipId }
									activeTooltipId={ activeTooltipId }
									id={ `${ planSlug }-jp-logo-${ mapIndex }` }
								>
									<JetpackLogo size={ 16 } />
								</Plans2023Tooltip>
							</div>
							<PlanFeatures2023GridFeatures
								features={ jetpackFeatures }
								planSlug={ planSlug }
								paidDomainName={ paidDomainName }
								generatedWPComSubdomain={ generatedWPComSubdomain }
								hideUnavailableFeatures={ hideUnavailableFeatures }
								isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
								setActiveTooltipId={ setActiveTooltipId }
								activeTooltipId={ activeTooltipId }
							/>
						</>
					) }
				</PlanDivOrTdContainer>
			);
		}
	);
};
export default PlanFeaturesList;
