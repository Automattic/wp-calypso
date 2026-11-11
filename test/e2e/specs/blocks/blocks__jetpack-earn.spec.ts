import {
	AdFlow,
	BlockFlow,
	DonationsFormFlow,
	envVariables,
	PaywallFlow,
} from '@automattic/calypso-e2e';
import { tags } from '../../lib/pw-base';
import { createBlockTests } from './shared/block-smoke-testing';

const blockFlows: BlockFlow[] = [
	// Skip OpenTable block test for now, block is broken due to upstream API changes.
	// https://github.com/Automattic/jetpack/issues/39410
	new DonationsFormFlow(
		{
			frequency: 'Yearly',
			currency: 'CAD',
		},
		{
			frequency: 'Yearly',
			customAmount: 50,
			predefinedAmount: 5,
		}
	),
];

// The Ad block is only available on more premium plans that imply AT.
// Furthermore, private sites are not eligible to monetize due to the site being private.
if (
	envVariables.JETPACK_TARGET === 'wpcom-deployment' &&
	envVariables.TEST_ON_ATOMIC === true &&
	envVariables.ATOMIC_VARIATION !== 'private'
) {
	blockFlows.push( new AdFlow( {} ) );
}

// Paywall also does not apply to Private sites.
if ( envVariables.ATOMIC_VARIATION !== 'private' ) {
	// Splice instead of push because the Donations block should be the last item
	// because clicking "Pay now" behavior is slightly unpredictable.
	blockFlows.splice(
		-1,
		0,
		new PaywallFlow( {
			prePaywallText: 'Pre-paywall text',
			postPaywallText: 'Post-paywall text',
		} )
	);
}

createBlockTests( 'Blocks: Jetpack Earn', blockFlows, [
	tags.GUTENBERG,
	tags.JETPACK_WPCOM_INTEGRATION,
] );
