import { PLAN_WOOEXPRESS_MEDIUM, PLAN_WOOEXPRESS_SMALL } from '@automattic/calypso-products';
import AsyncLoad from 'calypso/components/async-load';

interface WooExpressPlansProps {
	siteId: number | string;
}

export function WooExpressPlans( props: WooExpressPlansProps ) {
	const { siteId } = props;

	const plansTableProps = {
		plans: [ PLAN_WOOEXPRESS_SMALL, PLAN_WOOEXPRESS_MEDIUM ],
		hidePlansFeatureComparison: true,
		siteId,
	};
	return (
		<div className="is-2023-pricing-grid">
			<AsyncLoad require="calypso/my-sites/plan-features-2023-grid" { ...plansTableProps } />
		</div>
	);
}
