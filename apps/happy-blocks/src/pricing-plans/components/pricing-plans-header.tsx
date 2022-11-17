import { createInterpolateElement } from '@wordpress/element';
import { FunctionComponent } from 'react';
import { PricingPlan } from '../types';

interface Props {
	plan: PricingPlan;
}

const PricingPlansHeader: FunctionComponent< Props > = ( { plan } ) => {
	return (
		<section className="hb-pricing-plans-embed__header">
			<div className="hb-pricing-plans-embed__header-label">{ plan.label }</div>
			<div className="hb-pricing-plans-embed__header-domain">{ plan.domain }</div>
			<div className="hb-pricing-plans-embed__header-description">
				{ createInterpolateElement( plan.description, {
					learnMore: <a href={ plan.learnMoreLink } />,
					p: <p />,
				} ) }
			</div>
		</section>
	);
};

export default PricingPlansHeader;
