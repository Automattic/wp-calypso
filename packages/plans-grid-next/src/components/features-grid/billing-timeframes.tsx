import clsx from 'clsx';
import { GridPlan } from '../../types';
import PlanDivOrTdContainer from '../plan-div-td-container';
import BillingTimeframe from '../shared/billing-timeframe';

type BillingTimeframesProps = {
	renderedGridPlans: GridPlan[];
	showRefundPeriod?: boolean;
	options?: {
		isTableCell?: boolean;
	};
};

const BillingTimeframes = ( {
	options,
	renderedGridPlans,
	showRefundPeriod,
}: BillingTimeframesProps ) => {
	return renderedGridPlans.map( ( { planSlug, current } ) => {
		const classes = clsx(
			'plan-features-2023-grid__table-item',
			'plan-features-2023-grid__header-billing-info'
		);

		return (
			<PlanDivOrTdContainer
				className={ classes }
				isTableCell={ options?.isTableCell }
				key={ planSlug }
			>
				<BillingTimeframe
					planSlug={ planSlug }
					showRefundPeriod={ showRefundPeriod }
					isCurrentPlan={ current }
				/>
			</PlanDivOrTdContainer>
		);
	} );
};

export default BillingTimeframes;
