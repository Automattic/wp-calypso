import { GridPlan } from '../../types';
import PlanDivOrTdContainer from '../shared/plan-div-td-container';
import PlanHeaderPrice from '../shared/plan-header-price';

type PlanPriceProps = {
	currentSitePlanSlug?: string | null;
	planUpgradeCreditsApplicable?: number | null;
	renderedGridPlans: GridPlan[];
	options?: {
		isTableCell?: boolean;
	};
};

const PlanPrice = ( {
	currentSitePlanSlug,
	options,
	planUpgradeCreditsApplicable,
	renderedGridPlans,
}: PlanPriceProps ) => {
	return renderedGridPlans.map( ( { planSlug } ) => {
		return (
			<PlanDivOrTdContainer
				scope="col"
				key={ planSlug }
				className="plan-features-2023-grid__table-item plan-price"
				isTableCell={ options?.isTableCell }
			>
				<PlanHeaderPrice
					planSlug={ planSlug }
					planUpgradeCreditsApplicable={ planUpgradeCreditsApplicable }
					currentSitePlanSlug={ currentSitePlanSlug }
					visibleGridPlans={ renderedGridPlans }
				/>
			</PlanDivOrTdContainer>
		);
	} );
};

export default PlanPrice;
