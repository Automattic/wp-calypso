import { JetpackLogo } from '@automattic/components';
import { LocalizeProps } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import { hasTouch } from 'calypso/lib/touch-detect';
import PlanFeatures2023GridFeatures from '../components/features';
import { DataResponse } from '../types';
import { Plans2023Tooltip } from './plans-2023-tooltip';
import type { GridPlan } from '../hooks/npm-ready/data-store/use-grid-plans';
import type { DomainSuggestion } from '@automattic/data-stores';

const PlanFeatures: React.FC< {
	plansWithFeatures: GridPlan[];
	paidDomainName?: string;
	wpcomFreeDomainSuggestion: DataResponse< DomainSuggestion >; // used to show a wpcom free domain in the Free plan column when a paid domain is picked.
	translate: LocalizeProps[ 'translate' ];
	hideUnavailableFeatures?: boolean; // used to hide features that are not available, instead of strike-through as explained in #76206
	selectedFeature?: string;
	isCustomDomainAllowedOnFreePlan: DataResponse< boolean >; // indicate when a custom domain is allowed to be used with the Free plan.
	isTableCell: boolean | undefined;
	Container: (
		props: React.HTMLAttributes< HTMLDivElement > | React.HTMLAttributes< HTMLTableCellElement >
	) => JSX.Element;
} > = ( {
	plansWithFeatures,
	paidDomainName,
	wpcomFreeDomainSuggestion,
	translate,
	hideUnavailableFeatures,
	selectedFeature,
	isCustomDomainAllowedOnFreePlan,
	isTableCell,
	Container,
} ) => {
	const [ activeTooltipId, setActiveTooltipId ] = useState( '' );
	const isTouch = hasTouch();

	useEffect( () => {
		if ( ! isTouch ) {
			return;
		}

		// Close all toolltips in mobile if the user clicks anywhere on the plan card.
		const closeAllTooltips = ( event: TouchEvent ) => {
			if ( ! event.target?.classList.contains( 'plans-2023-tooltip__hover-area-container' ) ) {
				setActiveTooltipId( '' );
			}
		};

		document.addEventListener( 'touchstart', closeAllTooltips );

		return () => {
			document.removeEventListener( 'touchstart', closeAllTooltips );
		};
	}, [ isTouch ] );

	return plansWithFeatures.map(
		( { planSlug, features: { wpcomFeatures, jetpackFeatures } }, mapIndex ) => {
			return (
				<Container
					key={ `${ planSlug }-${ mapIndex }` }
					isTableCell={ isTableCell }
					className="plan-features-2023-grid__table-item"
				>
					<PlanFeatures2023GridFeatures
						features={ wpcomFeatures }
						planSlug={ planSlug }
						paidDomainName={ paidDomainName }
						wpcomFreeDomainSuggestion={ wpcomFreeDomainSuggestion }
						hideUnavailableFeatures={ hideUnavailableFeatures }
						selectedFeature={ selectedFeature }
						isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
						setActiveTooltipId={ setActiveTooltipId }
						activeTooltipId={ activeTooltipId }
					/>
					{ jetpackFeatures.length !== 0 && (
						<div className="plan-features-2023-grid__jp-logo" key="jp-logo">
							<span className="plan-features-2023-grid__jp-logo-hover-area-expander">
								<Plans2023Tooltip
									text={ translate(
										'Security, performance and growth tools made by the WordPress experts.'
									) }
									setActiveTooltipId={ setActiveTooltipId }
									activeTooltipId={ activeTooltipId }
									id={ `${ planSlug }-jp-logo-${ mapIndex }` }
								>
									<JetpackLogo size={ 16 } />
								</Plans2023Tooltip>
							</span>
						</div>
					) }
					<PlanFeatures2023GridFeatures
						features={ jetpackFeatures }
						planSlug={ planSlug }
						paidDomainName={ paidDomainName }
						wpcomFreeDomainSuggestion={ wpcomFreeDomainSuggestion }
						hideUnavailableFeatures={ hideUnavailableFeatures }
						isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
						setActiveTooltipId={ setActiveTooltipId }
						activeTooltipId={ activeTooltipId }
					/>
				</Container>
			);
		}
	);
};

export default PlanFeatures;
