import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { FunctionComponent } from 'react';
import config from '../config';
import { BlockPlan } from '../hooks/pricing-plans';

interface Props {
	plan: BlockPlan;
}

const PricingPlansHeader: FunctionComponent< Props > = ( { plan } ) => {
	return (
		<section className="hb-pricing-plans-embed__header">
			<div className="hb-pricing-plans-embed__header-label">{ plan.getTitle() }</div>
			<div className="hb-pricing-plans-embed__header-domain">
				{
					// translators: %s is the domain name of the plan
					sprintf( __( 'for %s', 'happy-blocks' ), config.domain )
				}
			</div>
			<div className="hb-pricing-plans-embed__header-description">
				<p>{ plan.getDescription() }</p>
				<p>
					{ createInterpolateElement( __( '<a>Learn more</a>', 'happy-blocks' ), {
						a: (
							<a
								target="_blank"
								href={ `https://wordpress.com/plans/${ config.domain }` }
								rel="noreferrer"
							/>
						),
					} ) }
				</p>
			</div>
		</section>
	);
};

export default PricingPlansHeader;
