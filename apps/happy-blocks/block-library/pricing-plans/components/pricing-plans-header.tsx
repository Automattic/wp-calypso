import { useLocalizeUrl } from '@automattic/i18n-utils';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { FunctionComponent } from 'react';
import { BlockPlan } from '../hooks/pricing-plans';
import { BlockAttributes } from '../types';

interface Props {
	currentPlan: BlockPlan;
	attributes: BlockAttributes;
}

const PricingPlansHeader: FunctionComponent< Props > = ( { currentPlan, attributes } ) => {
	const localizeUrl = useLocalizeUrl();
	let learnMoreLink = localizeUrl( 'https://wordpress.com/pricing/' );

	if ( attributes.domain ) {
		learnMoreLink = `https://wordpress.com/plans/${ attributes.domain }`;
	}

	if ( attributes.affiliateLink ) {
		learnMoreLink = attributes.affiliateLink;
	}

	return (
		<section className="hb-pricing-plans-embed__header">
			<div className="hb-pricing-plans-embed__header-label">{ currentPlan.productNameShort }</div>
			{ attributes.domain && (
				<div className="hb-pricing-plans-embed__header-domain">
					{
						// translators: %s is the domain name of the plan
						sprintf( __( 'for %s', 'happy-blocks' ), attributes.domain )
					}
				</div>
			) }
			<div className="hb-pricing-plans-embed__header-description">
				<p>{ currentPlan.getDescription() }</p>
				<p>
					{ createInterpolateElement( __( '<a>Learn more</a>', 'happy-blocks' ), {
						a: (
							<a
								className="hb-pricing-plans-embed__header-learn-more"
								target="_blank"
								href={ learnMoreLink }
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
