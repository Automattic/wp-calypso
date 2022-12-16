import { recordTracksEvent } from '@automattic/calypso-analytics';
import { BlockSaveProps } from '@wordpress/blocks';
import { FunctionComponent } from 'react';
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
	plan: BlockPlan;
	plans: BlockPlan[];
	setPlan: ( productSlug?: string ) => void;
}

const PricingPlanDetail: FunctionComponent< BlockSaveProps< BlockAttributes > & Props > = ( {
	plan,
	plans,
	attributes,
	setPlan,
} ) => {
	const onCtaClick = () => {
		recordTracksEvent( 'calypso_happyblocks_upgrade_plan_click', {
			plan: plan.productSlug,
			domain: attributes.domain,
		} );
	};

	const CtaLink = attributes.domain
		? `${ CHECKOUT_URL }/${ attributes.domain }/${ plan.pathSlug }`
		: PLANS_URL;

	return (
		<section className="hb-pricing-plans-embed__detail">
			<div>
				<BillingInfo plan={ plan } />
				<BillingOptions plans={ plans } value={ attributes.productSlug } onChange={ setPlan } />
			</div>
			<BillingButton onClick={ onCtaClick } href={ CtaLink }>
				{ plan.upgradeLabel }
			</BillingButton>
		</section>
	);
};
export default PricingPlanDetail;
