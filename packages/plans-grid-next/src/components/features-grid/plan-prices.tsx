import { GridPlan } from '../../types';
import PlanDivOrTdContainer from '../plan-div-td-container';
import HeaderPrice from '../shared/header-price';

type PlanPricesProps = {
	currentSitePlanSlug?: string | null;
	renderedGridPlans: GridPlan[];
	options?: {
		isTableCell?: boolean;
	};
};

const PlanPrices = ( { currentSitePlanSlug, options, renderedGridPlans }: PlanPricesProps ) => {
	return renderedGridPlans.map( ( { planSlug } ) => {
		return (
			<PlanDivOrTdContainer
				scope="col"
				key={ planSlug }
				className="plan-features-2023-grid__table-item plan-price"
				isTableCell={ options?.isTableCell }
			>
				<HeaderPrice
					planSlug={ planSlug }
					currentSitePlanSlug={ currentSitePlanSlug }
					visibleGridPlans={ renderedGridPlans }
				/>
			</PlanDivOrTdContainer>
		);
	} );
};

export default PlanPrices;
