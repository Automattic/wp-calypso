import { getPlanClass } from '@automattic/calypso-products';
import clsx from 'clsx';
import { GridPlan } from '../../types';
import PlanDivOrTdContainer from '../plan-div-td-container';

type PlanHeadersProps = {
	renderedGridPlans: GridPlan[];
	options?: {
		isTableCell?: boolean;
		isHeader?: boolean;
		scope?: string;
	};
};

const PlanHeaders = ( { options, renderedGridPlans }: PlanHeadersProps ) => {
	return renderedGridPlans.map( ( { planSlug, planTitle } ) => {
		const headerClasses = clsx( 'plan-features-2023-grid__header', getPlanClass( planSlug ) );

		return (
			<PlanDivOrTdContainer
				key={ planSlug }
				className="plan-features-2023-grid__table-item"
				isTableCell={ options?.isTableCell }
				scope={ options?.scope }
				isHeader={ options?.isHeader }
			>
				<div role="columnheader" className={ headerClasses }>
					<h4 className="plan-features-2023-grid__header-title">{ planTitle }</h4>
				</div>
			</PlanDivOrTdContainer>
		);
	} );
};

export default PlanHeaders;
