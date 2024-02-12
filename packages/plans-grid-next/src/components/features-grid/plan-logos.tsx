import { GridPlan } from '../../types';
import PlanLogo from '../plan-logo';

type PlanLogosProps = {
	isInSignup: boolean;
	renderedGridPlans: GridPlan[];
	options?: {
		isTableCell?: boolean;
	};
};

const PlanLogos = ( { isInSignup, options, renderedGridPlans }: PlanLogosProps ) => {
	return renderedGridPlans.map( ( { planSlug }, index ) => {
		return (
			<PlanLogo
				key={ planSlug }
				planSlug={ planSlug }
				planIndex={ index }
				renderedGridPlans={ renderedGridPlans }
				isInSignup={ isInSignup }
				isTableCell={ options?.isTableCell }
			/>
		);
	} );
};

export default PlanLogos;
