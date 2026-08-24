import { Tooltip } from '@wordpress/components';
import {
	getOrderProductNames,
	getOrderSummary,
	MAX_SUMMARY_PRODUCT_NAMES,
} from '../lib/get-order-summary';
import type { AgencyProduct, ReferralApiResponse } from '@automattic/api-core';

import './order-summary.scss';

export default function OrderSummary( {
	order,
	products,
}: {
	order: ReferralApiResponse;
	products?: AgencyProduct[];
} ) {
	const summary = getOrderSummary( order, products );
	const names = getOrderProductNames( order, products );

	if ( names.length <= MAX_SUMMARY_PRODUCT_NAMES ) {
		return <>{ summary }</>;
	}

	return (
		<Tooltip className="referrals-order-summary__tooltip" text={ names.join( '\n' ) }>
			<span>{ summary }</span>
		</Tooltip>
	);
}
