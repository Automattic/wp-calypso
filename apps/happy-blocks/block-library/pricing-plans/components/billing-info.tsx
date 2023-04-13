import { isWpComMonthlyPlan } from '@automattic/calypso-products';
import { __ } from '@wordpress/i18n';
import { FunctionComponent } from 'react';
import { BlockPlan } from '../hooks/pricing-plans';

interface Props {
	plan: BlockPlan;
}

const BillingInfo: FunctionComponent< Props > = ( { plan } ) => {
	return (
		<div className="hb-pricing-plans-embed__billing-info">
			<span className="hb-pricing-plans-embed__billing-info-value">{ plan.price }</span>
			<span className="hb-pricing-plans-embed__billing-info-description">
				/
				{ isWpComMonthlyPlan( plan.productSlug )
					? __( 'month', 'happy-blocks' )
					: __( 'month, billed annually', 'happy-blocks' ) }
			</span>
		</div>
	);
};

export default BillingInfo;
