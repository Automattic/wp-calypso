import { JetpackLogo } from '@automattic/components';
import { useDesktopBreakpoint } from '@automattic/viewport-react';
import { LocalizeProps } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import PlanFeatures2023GridFeatures from '../components/features';
import { PlanProperties, DataResponse } from '../types';
import { Plans2023Tooltip } from './plans-2023-tooltip';
import type { DomainSuggestion } from '@automattic/data-stores';

const PlanFeatures: React.FC< {
	planProperties: PlanProperties[];
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
	planProperties,
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
	const isDesktop = useDesktopBreakpoint();

	useEffect( () => {
		if ( isDesktop ) {
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
	}, [ isDesktop ] );

	return planProperties
		.filter( ( { isVisible } ) => isVisible )
		.map( ( properties, mapIndex ) => {
			const { planName, features, jpFeatures } = properties;
			return (
				<Container
					key={ `${ planName }-${ mapIndex }` }
					isTableCell={ isTableCell }
					className="plan-features-2023-grid__table-item"
				>
					<PlanFeatures2023GridFeatures
						features={ features }
						planName={ planName }
						paidDomainName={ paidDomainName }
						wpcomFreeDomainSuggestion={ wpcomFreeDomainSuggestion }
						hideUnavailableFeatures={ hideUnavailableFeatures }
						selectedFeature={ selectedFeature }
						isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
						setActiveTooltipId={ setActiveTooltipId }
						activeTooltipId={ activeTooltipId }
					/>
					{ jpFeatures.length !== 0 && (
						<div className="plan-features-2023-grid__jp-logo" key="jp-logo">
							<Plans2023Tooltip
								text={ translate(
									'Security, performance and growth tools made by the WordPress experts.'
								) }
								setActiveTooltipId={ setActiveTooltipId }
								activeTooltipId={ activeTooltipId }
								id={ `${ planName }-jp-logo-${ mapIndex }` }
							>
								<JetpackLogo size={ 16 } />
							</Plans2023Tooltip>
						</div>
					) }
					<PlanFeatures2023GridFeatures
						features={ jpFeatures }
						planName={ planName }
						paidDomainName={ paidDomainName }
						wpcomFreeDomainSuggestion={ wpcomFreeDomainSuggestion }
						hideUnavailableFeatures={ hideUnavailableFeatures }
						isCustomDomainAllowedOnFreePlan={ isCustomDomainAllowedOnFreePlan }
						setActiveTooltipId={ setActiveTooltipId }
						activeTooltipId={ activeTooltipId }
					/>
				</Container>
			);
		} );
};

export default PlanFeatures;
