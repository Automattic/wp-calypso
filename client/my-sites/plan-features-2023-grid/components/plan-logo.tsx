import {
	getPlanClass,
	isEcommercePlan,
	isBusinessPlan,
	isWooExpressPlan,
	isWpcomEnterpriseGridPlan,
	isPersonalPlan,
	isPremiumPlan,
	isFreePlan,
} from '@automattic/calypso-products';
import { CloudLogo, VIPLogo, WooLogo } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { PlanSlug } from 'calypso/types';
import { Plans2023Tooltip } from '../components/plans-2023-tooltip';
import PopularBadge from '../components/popular-badge';
import { usePlansGridContext } from '../grid-context';
import useHighlightAdjacencyMatrix from '../hooks/npm-ready/use-highlight-adjacency-matrix';
import type { GridPlan } from '../hooks/npm-ready/data-store/use-grid-plans';

const PlanLogo: React.FunctionComponent< {
	renderedGridPlans: GridPlan[];
	planSlug: PlanSlug;
	isInSignup?: boolean;
	renderedPlans: PlanSlug[];
	isTableCell?: boolean;
	planIndex: number;
	Container: (
		props: React.HTMLAttributes< HTMLDivElement > | React.HTMLAttributes< HTMLTableCellElement >
	) => JSX.Element;
} > = ( { planSlug, isInSignup, renderedGridPlans, isTableCell, Container, planIndex } ) => {
	const [ activeTooltipId, setActiveTooltipId ] = useState( '' );
	const translate = useTranslate();
	const shouldShowWooLogo = isEcommercePlan( planSlug ) && ! isWooExpressPlan( planSlug );
	const { gridPlansIndex } = usePlansGridContext();
	const { current } = gridPlansIndex[ planSlug ];
	const highlightAdjacencyMatrix = useHighlightAdjacencyMatrix( {
		renderedPlans: renderedGridPlans.map( ( gridPlan ) => gridPlan.planSlug ),
	} );
	const headerClasses = classNames(
		'plan-features-2023-grid__header-logo',
		getPlanClass( planSlug )
	);
	const tableItemClasses = classNames( 'plan-features-2023-grid__table-item', {
		'popular-plan-parent-class': gridPlansIndex[ planSlug ]?.highlightLabel,
		'is-left-of-highlight': highlightAdjacencyMatrix[ planSlug ]?.leftOfHighlight,
		'is-right-of-highlight': highlightAdjacencyMatrix[ planSlug ]?.rightOfHighlight,
		'is-only-highlight': highlightAdjacencyMatrix[ planSlug ]?.isOnlyHighlight,
		'is-current-plan': current,
		'is-first-in-row': planIndex === 0,
		'is-last-in-row': planIndex === renderedPlans.length - 1,
	} );
	const popularBadgeClasses = classNames( {
		'with-plan-logo': ! (
			isFreePlan( planSlug ) ||
			isPersonalPlan( planSlug ) ||
			isPremiumPlan( planSlug )
		),
	} );

	return (
		<Container key={ planSlug } className={ tableItemClasses } isTableCell={ isTableCell }>
			<PopularBadge
				isInSignup={ isInSignup }
				planSlug={ planSlug }
				additionalClassName={ popularBadgeClasses }
			/>
			<header className={ headerClasses }>
				{ isBusinessPlan( planSlug ) && (
					<Plans2023Tooltip
						text={ translate(
							'WP Cloud gives you the tools you need to add scalable, highly available, extremely fast WordPress hosting.'
						) }
						id="wp-cloud-logo"
						setActiveTooltipId={ setActiveTooltipId }
						activeTooltipId={ activeTooltipId }
					>
						<CloudLogo />
					</Plans2023Tooltip>
				) }
				{ shouldShowWooLogo && (
					<Plans2023Tooltip
						text={ translate( 'Make your online store a reality with the power of WooCommerce.' ) }
						id="woo-logo"
						setActiveTooltipId={ setActiveTooltipId }
						activeTooltipId={ activeTooltipId }
					>
						<WooLogo />
					</Plans2023Tooltip>
				) }
				{ isWpcomEnterpriseGridPlan( planSlug ) && (
					<Plans2023Tooltip
						text={ translate( 'The trusted choice for enterprise WordPress hosting.' ) }
						id="enterprise-logo"
						setActiveTooltipId={ setActiveTooltipId }
						activeTooltipId={ activeTooltipId }
					>
						<VIPLogo />
					</Plans2023Tooltip>
				) }
			</header>
		</Container>
	);
};

export default PlanLogo;
