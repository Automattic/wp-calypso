import { GridPlan } from '../../types';
import PlanDivOrTdContainer from '../plan-div-td-container';

type PlanTaglineProps = {
	renderedGridPlans: GridPlan[];
	options?: {
		isTableCell?: boolean;
	};
};

const PlanTagline = ( { options, renderedGridPlans }: PlanTaglineProps ) => {
	return renderedGridPlans.map( ( { planSlug, tagline } ) => {
		return (
			<PlanDivOrTdContainer
				key={ planSlug }
				className="plan-features-2023-grid__table-item"
				isTableCell={ options?.isTableCell }
			>
				<div className="plan-features-2023-grid__header-tagline">{ tagline }</div>
			</PlanDivOrTdContainer>
		);
	} );
};

export default PlanTagline;
