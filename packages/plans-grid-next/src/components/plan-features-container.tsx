import { JetpackLogo } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useManageTooltipToggle } from '../hooks/use-manage-tooltip-toggle';
import { DataResponse, GridPlan } from '../types';
import PlanFeatures2023GridFeatures from './features';
import { PlanFeaturesItem } from './item';
import PlanDivOrTdContainer from './plan-div-td-container';
import { Plans2023Tooltip } from './plans-2023-tooltip';

const PlanFeaturesContainer: React.FC< {
	plansWithFeatures: GridPlan[];
	paidDomainName?: string;
	generatedWPComSubdomain: DataResponse< { domain_name: string } >; // used to show a wpcom free domain in the Free plan column when a paid domain is picked.
	hideUnavailableFeatures?: boolean; // used to hide features that are not available, instead of strike-through as explained in #76206
	selectedFeature?: string;
	isCustomDomainAllowedOnFreePlan: boolean; // indicate when a custom domain is allowed to be used with the Free plan.
	isTableCell: boolean | undefined;
	featureGroup?: string | null;
} > = ( {
	plansWithFeatures,
	paidDomainName,
	generatedWPComSubdomain,
	hideUnavailableFeatures,
	selectedFeature,
	isCustomDomainAllowedOnFreePlan,
	isTableCell,
	featureGroup,
} ) => {
	const [ activeTooltipId, setActiveTooltipId ] = useManageTooltipToggle();
	const translate = useTranslate();

	return plansWithFeatures.map(
		( { planSlug, features: { wpcomFeatures, jetpackFeatures } }, mapIndex ) => {
			const shouldRenderFeatures = featureGroup
				? false // TODO: this is a placeholder. obviously check here if there's a feature in that group
				: true;

			// if ( ! shouldRenderFeatures ) {
			// 	// Render a placeholder to keep the grid aligned
			// 	return (
			// 		<PlanDivOrTdContainer
			// 			key={ `${ planSlug }-${ mapIndex }` }
			// 			isTableCell={ isTableCell }
			// 			className="plan-features-2023-grid__table-item"
			// 		/>
			// 	);
			// }

			return (
				<PlanDivOrTdContainer
					key={ `${ planSlug }-${ mapIndex }` }
					isTableCell={ isTableCell }
					className="plan-features-2023-grid__table-item"
				>
					{ featureGroup && (
						<PlanFeaturesItem>
							<h2 className="plans-grid-next-features-grid__feature-group-title">
								{ featureGroup }
							</h2>
						</PlanFeaturesItem>
					) }
					<PlanFeatures2023GridFeatures
						features={ wpcomFeatures } // TODO: filter for the right feature group
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

export default PlanFeaturesContainer;
