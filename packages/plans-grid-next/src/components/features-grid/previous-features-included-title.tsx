import {
	getPlanClass,
	isWpComFreePlan,
	isWpcomEnterpriseGridPlan,
} from '@automattic/calypso-products';
import { useMemo } from '@wordpress/element';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { usePlansGridContext } from '../../grid-context';
import { GridPlan } from '../../types';
import PlanDivOrTdContainer from '../plan-div-td-container';

type PreviousFeaturesIncludedTitleProps = {
	renderedGridPlans: GridPlan[];
	options?: {
		isTableCell?: boolean;
	};
};

const PreviousFeaturesIncludedTitle = ( {
	renderedGridPlans,
	options,
}: PreviousFeaturesIncludedTitleProps ) => {
	const translate = useTranslate();

	/**
	 * This is a pretty critical and fragile, as it filters out the enterprise plan.
	 * If the plan sits anywhere else but the tail/end, it will most likely break the grid (render wrong parts at wrong places).
	 */
	const plansWithFeatures = useMemo( () => {
		return renderedGridPlans.filter(
			( gridPlan ) => ! isWpcomEnterpriseGridPlan( gridPlan.planSlug )
		);
	}, [ renderedGridPlans ] );

	const { gridPlans } = usePlansGridContext();

	return plansWithFeatures.map( ( { planSlug } ) => {
		const shouldShowFeatureTitle = ! isWpComFreePlan( planSlug );
		const indexInGridPlansForFeaturesGrid = gridPlans.findIndex(
			( { planSlug: slug } ) => slug === planSlug
		);
		const previousProductName =
			indexInGridPlansForFeaturesGrid > 0
				? gridPlans[ indexInGridPlansForFeaturesGrid - 1 ].productNameShort
				: null;
		const title =
			previousProductName &&
			translate( 'Everything in %(planShortName)s, plus:', {
				args: { planShortName: previousProductName },
			} );
		const classes = clsx( 'plan-features-2023-grid__common-title', getPlanClass( planSlug ) );

		return (
			<PlanDivOrTdContainer
				key={ planSlug }
				isTableCell={ options?.isTableCell }
				className="plan-features-2023-grid__table-item"
			>
				{ shouldShowFeatureTitle && <div className={ classes }>{ title }</div> }
			</PlanDivOrTdContainer>
		);
	} );
};

export default PreviousFeaturesIncludedTitle;
