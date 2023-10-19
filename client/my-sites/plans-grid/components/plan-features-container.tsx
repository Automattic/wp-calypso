import { JetpackLogo } from '@automattic/components';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import i18n, { LocalizeProps } from 'i18n-calypso';
import { useManageTooltipToggle } from 'calypso/my-sites/plans-grid/hooks/use-manage-tooltip-toggle';
import { DataResponse } from '../types';
import PlanFeatures2023GridFeatures from './features';
import PlanDivOrTdContainer from './plan-div-td-container';
import { Plans2023Tooltip } from './plans-2023-tooltip';
import type { GridPlan } from '../hooks/npm-ready/data-store/use-grid-plans';

const PlanFeaturesContainer: React.FC< {
	plansWithFeatures: GridPlan[];
	paidDomainName?: string;
	generatedWPComSubdomain: DataResponse< { domain_name: string } >; // used to show a wpcom free domain in the Free plan column when a paid domain is picked.
	translate: LocalizeProps[ 'translate' ];
	hideUnavailableFeatures?: boolean; // used to hide features that are not available, instead of strike-through as explained in #76206
	selectedFeature?: string;
	isCustomDomainAllowedOnFreePlan: DataResponse< boolean >; // indicate when a custom domain is allowed to be used with the Free plan.
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
	const isEnglishLocale = useIsEnglishLocale();
	const shouldShowNewJPTooltipCopy =
		isEnglishLocale ||
		i18n.hasTranslation( 'Security, performance, and growth tools—powered by Jetpack.' );

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
								text={
									shouldShowNewJPTooltipCopy
										? translate( 'Security, performance, and growth tools—powered by Jetpack.' )
										: translate(
												'Security, performance and growth tools made by the WordPress experts.'
										  )
								}
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
				</PlanDivOrTdContainer>
			);
		}
	);
};

export default PlanFeaturesContainer;
