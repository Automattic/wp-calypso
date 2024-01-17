import config from '@automattic/calypso-config';
import { isAgencyBlueHostPlan } from '@automattic/calypso-products';
import { JetpackLogo } from '@automattic/components';
import { LocalizeProps } from 'i18n-calypso';
import { useManageTooltipToggle } from '../hooks/use-manage-tooltip-toggle';
import { DataResponse, GridPlan } from '../types';
import PlanFeatures2023GridFeatures from './features';
import PlanDivOrTdContainer from './plan-div-td-container';
import { Plans2023Tooltip } from './plans-2023-tooltip';

const TemporaryHardcodedBluehostFeaturesUI = () => {
	/* TODO: Replace WITH final feature list once finalized via proper feature data structure */

	return (
		<>
			<div className="is-agency-blue-host-host">
				<div className="plan-features-2023-grid__item plan-features-2023-grid__item-available">
					<div className="plan-features-2023-grid__item-info-container">
						<span className="plan-features-2023-grid__item-info is-available">
							<span className="plan-features-2023-grid__item-title">
								Unlimited managed migrations
							</span>
						</span>
					</div>
				</div>
			</div>
			<div className="is-agency-blue-host-host">
				<div className="plan-features-2023-grid__item plan-features-2023-grid__item-available">
					<div className="plan-features-2023-grid__item-info-container">
						<span className="plan-features-2023-grid__item-info is-available">
							<span className="plan-features-2023-grid__item-title">
								24/7 support, 365 days a year
							</span>
						</span>
					</div>
				</div>
			</div>
			<div className="is-agency-blue-host-host">
				<div className="plan-features-2023-grid__item plan-features-2023-grid__item-available">
					<div className="plan-features-2023-grid__item-info-container">
						<span className="plan-features-2023-grid__item-info is-available">
							<span className="plan-features-2023-grid__item-title">Site management tools</span>
						</span>
					</div>
				</div>
			</div>
			<div className="is-agency-blue-host-host">
				<div className="plan-features-2023-grid__item plan-features-2023-grid__item-available">
					<div className="plan-features-2023-grid__item-info-container">
						<span className="plan-features-2023-grid__item-info is-available">
							<span className="plan-features-2023-grid__item-title">
								Detailed permission control
							</span>
						</span>
					</div>
				</div>
			</div>

			<div className="is-agency-blue-host-host">
				<div className="plan-features-2023-grid__item plan-features-2023-grid__item-available">
					<div className="plan-features-2023-grid__item-info-container">
						<span className="plan-features-2023-grid__item-info is-available">
							<span className="plan-features-2023-grid__item-title">
								Site performance reporting
							</span>
						</span>
					</div>
				</div>
			</div>
		</>
	);
};

const PlanFeaturesContainer: React.FC< {
	plansWithFeatures: GridPlan[];
	paidDomainName?: string;
	generatedWPComSubdomain: DataResponse< { domain_name: string } >; // used to show a wpcom free domain in the Free plan column when a paid domain is picked.
	translate: LocalizeProps[ 'translate' ];
	hideUnavailableFeatures?: boolean; // used to hide features that are not available, instead of strike-through as explained in #76206
	selectedFeature?: string;
	isCustomDomainAllowedOnFreePlan: boolean; // indicate when a custom domain is allowed to be used with the Free plan.
	isTableCell: boolean | undefined;
} > = ( {
	plansWithFeatures,
	paidDomainName,
	generatedWPComSubdomain,
	translate,
	hideUnavailableFeatures,
	selectedFeature,
	isCustomDomainAllowedOnFreePlan,
	isTableCell,
} ) => {
	const [ activeTooltipId, setActiveTooltipId ] = useManageTooltipToggle();

	return plansWithFeatures.map(
		( { planSlug, features: { wpcomFeatures, jetpackFeatures } }, mapIndex ) => {
			return (
				<PlanDivOrTdContainer
					key={ `${ planSlug }-${ mapIndex }` }
					isTableCell={ isTableCell }
					className="plan-features-2023-grid__table-item"
				>
					<PlanFeatures2023GridFeatures
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
							<Plans2023Tooltip
								text={ translate( 'Security, performance, and growth tools—powered by Jetpack.' ) }
								setActiveTooltipId={ setActiveTooltipId }
								activeTooltipId={ activeTooltipId }
								id={ `${ planSlug }-jp-logo-${ mapIndex }` }
							>
								<JetpackLogo size={ 16 } />
							</Plans2023Tooltip>
						</div>
					) }
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
					{ config.isEnabled( 'bluehost-in-plans-grid' ) && isAgencyBlueHostPlan( planSlug ) && (
						<TemporaryHardcodedBluehostFeaturesUI />
					) }
				</PlanDivOrTdContainer>
			);
		}
	);
};

export default PlanFeaturesContainer;
