import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { FunctionComponent } from 'react';
import { BlockPlan } from '../hooks/pricing-plans';
import { BlockAttributes } from '../types';

interface Props {
	plan: BlockPlan;
	attributes: BlockAttributes;
}

const PricingPlansHeader: FunctionComponent< Props > = ( { plan, attributes } ) => {
	return (
		<section className="hb-pricing-plans-embed__header">
			<div className="hb-pricing-plans-embed__header-label">{ plan.getTitle() }</div>
			<div className="hb-pricing-plans-embed__header-domain">
				{
					// translators: %s is the domain name of the plan
					sprintf( __( 'for %s', 'happy-blocks' ), attributes.domain )
				}
			</div>
			<div className="hb-pricing-plans-embed__header-description">
				<p>{ plan.getDescription() }</p>
				<p>
					{ createInterpolateElement( __( '<a>Learn more</a>', 'happy-blocks' ), {
						a: (
							<a
								target="_blank"
								href={ `https://wordpress.com/plans/${ attributes.domain }` }
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
