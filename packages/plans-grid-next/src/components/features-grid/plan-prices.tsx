import { GridPlan } from '../../types';
import PlanDivOrTdContainer from '../plan-div-td-container';
import HeaderPrice from '../shared/header-price';
import HeaderPriceContextProvider from '../shared/header-price/header-price-context';

type PlanPricesProps = {
	currentSitePlanSlug?: string | null;
	renderedGridPlans: GridPlan[];
	options?: {
		isTableCell?: boolean;
	};
};

const PlanPrices = ( { currentSitePlanSlug, options, renderedGridPlans }: PlanPricesProps ) => {
	return (
		<HeaderPriceContextProvider>
			{ renderedGridPlans.map( ( { planSlug } ) => {
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
			} ) }
		</HeaderPriceContextProvider>
	);
};

export default PlanPrices;
