import { recordTracksEvent } from '@automattic/calypso-analytics';
import { BlockSaveProps } from '@wordpress/blocks';
import { FunctionComponent } from 'react';
import config from '../config';
import { BlockPlan } from '../hooks/pricing-plans';
import { BlockAttributes } from '../types';
import BillingButton from './billing-button';
import BillingInfo from './billing-info';
import BillingOptions from './billing-options';

/**
 * These URLs are broken down into parts due to 119-gh-Automattic/lighthouse-forums
 */
const CHECKOUT_URL = 'https' + '://' + 'wordpress.com/checkout';
const PLANS_URL = 'https' + '://' + 'wordpress.com/plans';

interface Props {
	currentPlan: BlockPlan;
	plans: BlockPlan[];
	setPlan: ( productSlug: string ) => void;
}

const PricingPlanDetail: FunctionComponent< BlockSaveProps< BlockAttributes > & Props > = ( {
	currentPlan,
	plans,
	attributes,
	setPlan,
} ) => {
	const onCtaClick = () => {
		if ( ! config.features.tracking ) {
			return;
		}

		recordTracksEvent( 'calypso_happyblocks_upgrade_plan_click', {
			plan: currentPlan.productSlug,
			domain: attributes.domain,
			affiliateLink: attributes.affiliateLink,
		} );
	};

	let CtaLink = PLANS_URL;

	if ( attributes.domain ) {
		CtaLink = `${ CHECKOUT_URL }/${ attributes.domain }/${ currentPlan.pathSlug }`;
	}

	if ( attributes.affiliateLink ) {
		CtaLink = attributes.affiliateLink;
	}

	return (
		<section className="hb-pricing-plans-embed__detail">
			<div>
				<BillingInfo plan={ currentPlan } />
				<BillingOptions plans={ plans } value={ attributes.productSlug } onChange={ setPlan } />
			</div>
			<BillingButton onClick={ onCtaClick } href={ CtaLink }>
				{ currentPlan.upgradeLabel }
			</BillingButton>
		</section>
	);
};
export default PricingPlanDetail;
