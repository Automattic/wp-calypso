import {
	type FeatureGroupSlug,
	isWpcomEnterpriseGridPlan,
	FEATURE_GROUP_STORAGE,
	FEATURE_GROUP_ALL_FEATURES,
} from '@automattic/calypso-products';
import { JetpackLogo } from '@automattic/components';
import { AddOns } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { usePlansGridContext } from '../../grid-context';
import { useManageTooltipToggle } from '../../hooks/use-manage-tooltip-toggle';
import PlanFeatures2023GridFeatures from '../features';
import { PlanFeaturesItem } from '../item';
import PlanDivOrTdContainer from '../plan-div-td-container';
import { Plans2023Tooltip } from '../plans-2023-tooltip';
import { PlanStorage } from '../shared/storage';
import type { DataResponse, GridPlan } from '../../types';

type PlanFeaturesListProps = {
	/**
	 * Used to show a wpcom free domain in the Free plan column when a paid domain is picked.
	 */
	generatedWPComSubdomain?: DataResponse< { domain_name: string } >;
	/**
	 * Used to hide features that are not available, instead of strike-through as explained in #76206
	 */
	hideUnavailableFeatures?: boolean;
	/**
	 * Indicates when a custom domain is allowed to be used with the Free plan.
	 */
	isCustomDomainAllowedOnFreePlan?: boolean;
	paidDomainName?: string;
	renderedGridPlans: GridPlan[];
	selectedFeature?: string;
	options?: {
		isTableCell?: boolean;
	};
	featureGroupSlug?: FeatureGroupSlug;
	onStorageAddOnClick?: ( addOnSlug: AddOns.StorageAddOnSlug ) => void;
	showUpgradeableStorage: boolean;
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
	onStorageAddOnClick,
	showUpgradeableStorage = false,
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
			// This is temporary. Ideally all feature-groups will include the included features.
			const filteredWpcomFeatures =
				featureGroup?.slug === FEATURE_GROUP_ALL_FEATURES
					? wpcomFeatures
					: wpcomFeatures.filter(
							( feature ) => featureGroup?.getFeatures().includes( feature.getSlug() )
					  );

			/**
			 * 1. Storage group is still it's own thing, with no actual features associated. It will join the rest in a follow-up.
			 */
			if ( FEATURE_GROUP_STORAGE === featureGroup?.slug ) {
				return (
					<PlanDivOrTdContainer
						key={ `${ planSlug }-${ mapIndex }` }
						isTableCell={ options?.isTableCell }
						className="plan-features-2023-grid__table-item"
					>
						<PlanFeaturesItem>
							<h2 className="plans-grid-next-features-grid__feature-group-title">
								{ featureGroup?.getTitle() }
							</h2>
						</PlanFeaturesItem>
						<PlanFeaturesItem>
							<PlanStorage
								planSlug={ planSlug }
								options={ { isTableCell: true } }
								onStorageAddOnClick={ onStorageAddOnClick }
								showUpgradeableStorage={ showUpgradeableStorage }
							/>
						</PlanFeaturesItem>
					</PlanDivOrTdContainer>
				);
			}

			/**
			 * 2. Render a placeholder to keep the grid (table) aligned.
			 */
			if ( ! filteredWpcomFeatures.length ) {
				if ( options?.isTableCell ) {
					return (
						<PlanDivOrTdContainer
							key={ `${ planSlug }-${ mapIndex }` }
							isTableCell
							className="plan-features-2023-grid__table-item"
						/>
					);
				}

				// No placeholder required if the element is not a part of the table.
				return null;
			}

			/**
			 * 3. Everything else gets rendered as usual.
			 */
			return (
				<PlanDivOrTdContainer
					key={ `${ planSlug }-${ mapIndex }` }
					isTableCell={ options?.isTableCell }
					className="plan-features-2023-grid__table-item"
				>
					{ featureGroup?.getTitle() && (
						<PlanFeaturesItem>
							<h2 className="plans-grid-next-features-grid__feature-group-title">
								{ featureGroup?.getTitle() }
							</h2>
						</PlanFeaturesItem>
					) }
					<PlanFeatures2023GridFeatures
						features={ filteredWpcomFeatures }
						planSlug={ planSlug }
						paidDomainName={ paidDomainName }
						generatedWPComSubdomain={ generatedWPComSubdomain }
						hideUnavailableFeatures={ hideUnavailableFeatures }
						selectedFeature={ selectedFeature }
						isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
						setActiveTooltipId={ setActiveTooltipId }
						activeTooltipId={ activeTooltipId }
					/>
					{ jetpackFeatures.length !== 0 && (
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
