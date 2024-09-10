import clsx from 'clsx';
import { GridPlan, PlanActionOverrides } from '../../types';
import PlanDivOrTdContainer from '../plan-div-td-container';
import ActionButton from '../shared/action-button';

type TopButtonsProps = {
	currentSitePlanSlug?: string | null;
	isInSignup: boolean;
	planActionOverrides?: PlanActionOverrides;
	renderedGridPlans: GridPlan[];
	options?: {
		isTableCell?: boolean;
		isStuck?: boolean;
	};
};

const TopButtons = ( {
	currentSitePlanSlug,
	isInSignup,
	options,
	planActionOverrides,
	renderedGridPlans,
}: TopButtonsProps ) => {
	return renderedGridPlans.map( ( { planSlug, availableForPurchase, isMonthlyPlan } ) => {
		const classes = clsx( 'plan-features-2023-grid__table-item', 'is-top-buttons' );

		return (
			<PlanDivOrTdContainer
				key={ planSlug }
				className={ classes }
				isTableCell={ options?.isTableCell }
			>
				<ActionButton
					availableForPurchase={ availableForPurchase }
					isInSignup={ isInSignup }
					isMonthlyPlan={ isMonthlyPlan }
					planSlug={ planSlug }
					currentSitePlanSlug={ currentSitePlanSlug }
					planActionOverrides={ planActionOverrides }
					showMonthlyPrice
					isStuck={ options?.isStuck || false }
					visibleGridPlans={ renderedGridPlans }
				/>
			</PlanDivOrTdContainer>
		);
	} );
};

export default TopButtons;
