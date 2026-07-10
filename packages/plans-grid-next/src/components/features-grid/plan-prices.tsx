import { isWpcomEnterpriseGridPlan } from '@automattic/calypso-products';
import { usePlansGridContext } from '../../grid-context';
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
	const { isEnterpriseA4AIndia } = usePlansGridContext();
	return (
		<HeaderPriceContextProvider>
			{ renderedGridPlans.map( ( { planSlug } ) => {
				// The Enterprise price cell spans 2 rows to fit the client logos, except for
				// the India A4A card, whose logos move below the CTA and whose billing row
				// shows a price instead.
				const isEnterprise = isWpcomEnterpriseGridPlan( planSlug ) && ! isEnterpriseA4AIndia;
				return (
					<PlanDivOrTdContainer
						scope="col"
						key={ planSlug }
						className="plan-features-2023-grid__table-item plan-price"
						isTableCell={ options?.isTableCell }
						rowSpan={ isEnterprise && options?.isTableCell ? 2 : undefined }
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
