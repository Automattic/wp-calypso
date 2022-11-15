import { createInterpolateElement } from '@wordpress/element';
import { FunctionComponent } from 'react';
import { PricingPlan } from '../types';

interface Props {
	plan: PricingPlan;
}

const PricingPlansHeader: FunctionComponent< Props > = ( { plan } ) => {
	return (
		<section className="wp-block-a8c-pricing-plans__header">
			<div className="wp-block-a8c-pricing-plans__header-label">{ plan.label }</div>
			<div className="wp-block-a8c-pricing-plans__header-domain">{ plan.domain }</div>
			<div className="wp-block-a8c-pricing-plans__header-description">
				{ createInterpolateElement( plan.description, {
					learnMore: <a href={ plan.learnMoreLink } />,
					p: <p />,
				} ) }
			</div>
		</section>
	);
};

export default PricingPlansHeader;
