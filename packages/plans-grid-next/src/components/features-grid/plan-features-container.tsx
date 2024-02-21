import { JetpackLogo } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useManageTooltipToggle } from '../../hooks/use-manage-tooltip-toggle';
import { DataResponse, GridPlan } from '../../types';
import PlanDivOrTdContainer from '../shared/plan-div-td-container';
import { PlansTooltip } from '../shared/plans-tooltip';
import PlanFeatures from './plan-features';

const PlanFeaturesContainer: React.FC< {
	plansWithFeatures: GridPlan[];
	paidDomainName?: string;
	generatedWPComSubdomain: DataResponse< { domain_name: string } >; // used to show a wpcom free domain in the Free plan column when a paid domain is picked.
	hideUnavailableFeatures?: boolean; // used to hide features that are not available, instead of strike-through as explained in #76206
	selectedFeature?: string;
	isCustomDomainAllowedOnFreePlan: boolean; // indicate when a custom domain is allowed to be used with the Free plan.
	isTableCell: boolean | undefined;
} > = ( {
	plansWithFeatures,
	paidDomainName,
	generatedWPComSubdomain,
	hideUnavailableFeatures,
	selectedFeature,
	isCustomDomainAllowedOnFreePlan,
	isTableCell,
} ) => {
	const [ activeTooltipId, setActiveTooltipId ] = useManageTooltipToggle();
	const translate = useTranslate();

	return plansWithFeatures.map(
		( { planSlug, features: { wpcomFeatures, jetpackFeatures } }, mapIndex ) => {
			return (
				<PlanDivOrTdContainer
					key={ `${ planSlug }-${ mapIndex }` }
					isTableCell={ isTableCell }
					className="plan-features-2023-grid__table-item"
				>
					<PlanFeatures
						features={ wpcomFeatures }
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
						<div className="plan-features-2023-grid__jp-logo" key="jp-logo">
							<PlansTooltip
								text={ translate( 'Security, performance, and growth tools—powered by Jetpack.' ) }
								setActiveTooltipId={ setActiveTooltipId }
								activeTooltipId={ activeTooltipId }
								id={ `${ planSlug }-jp-logo-${ mapIndex }` }
							>
								<JetpackLogo size={ 16 } />
							</PlansTooltip>
						</div>
					) }
					<PlanFeatures
						features={ jetpackFeatures }
						planSlug={ planSlug }
						paidDomainName={ paidDomainName }
						generatedWPComSubdomain={ generatedWPComSubdomain }
						hideUnavailableFeatures={ hideUnavailableFeatures }
						isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
						setActiveTooltipId={ setActiveTooltipId }
						activeTooltipId={ activeTooltipId }
					/>
				</PlanDivOrTdContainer>
			);
		}
	);
};

export default PlanFeaturesContainer;
