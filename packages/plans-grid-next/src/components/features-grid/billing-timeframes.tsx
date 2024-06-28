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
	planUpgradeCreditsApplicable?: number | null;
};

const BillingTimeframes = ( {
	options,
	renderedGridPlans,
	showRefundPeriod,
	planUpgradeCreditsApplicable,
}: BillingTimeframesProps ) => {
	return renderedGridPlans.map( ( { planSlug } ) => {
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
					planUpgradeCreditsApplicable={ planUpgradeCreditsApplicable }
				/>
			</PlanDivOrTdContainer>
		);
	} );
};

export default BillingTimeframes;
