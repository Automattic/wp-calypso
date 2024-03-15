import classNames from 'classnames';
import { GridPlan } from '../../types';
import BillingTimeframe from '../shared/billing-timeframe';
import PlanDivOrTdContainer from '../shared/plan-div-td-container';

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
	return renderedGridPlans.map( ( { planSlug } ) => {
		const classes = classNames(
			'plan-features-2023-grid__table-item',
			'plan-features-2023-grid__header-billing-info'
		);

		return (
			<PlanDivOrTdContainer
				className={ classes }
				isTableCell={ options?.isTableCell }
				key={ planSlug }
			>
				<BillingTimeframe planSlug={ planSlug } showRefundPeriod={ showRefundPeriod } />
			</PlanDivOrTdContainer>
		);
	} );
};

export default BillingTimeframes;
