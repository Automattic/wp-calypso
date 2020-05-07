/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import './style.scss';
import PlanItem from './plan-item';
import { mockPlans } from '../mock-data';

import type { Plan } from '../../../lib/plans';

export interface Props {
	selectedPlan: Plan;
	onPlanSelect: ( planId: Plan ) => void;
}

const Plans: React.FunctionComponent< Props > = ( { selectedPlan, onPlanSelect } ) => {
	return (
		<div className="plans-table">
			<div className="plans-table__body">
				<div className="plans-table__items">
					{ mockPlans.map( ( { id, ...props }, i ) => (
						<PlanItem
							key={ i }
							id={ id }
							{ ...props }
							isSelected={ id === selectedPlan }
							onSelect={ onPlanSelect }
						></PlanItem>
					) ) }
				</div>
			</div>
		</div>
	);
};

export default Plans;
