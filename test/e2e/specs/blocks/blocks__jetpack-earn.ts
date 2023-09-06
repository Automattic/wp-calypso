/**
 * @group gutenberg
 * @group jetpack-wpcom-integration
 */
import {
	BlockFlow,
	PayWithPaypalBlockFlow,
	OpenTableFlow,
	DonationsFormFlow,
	AdFlow,
	envVariables,
	PaywallFlow,
	// PaymentsBlockFlow,
	// envVariables,
} from '@automattic/calypso-e2e';
import { createBlockTests } from './shared/block-smoke-testing';

const blockFlows: BlockFlow[] = [
	new PayWithPaypalBlockFlow( {
		name: 'Test Paypal Block',
		price: 900,
		email: 'test@wordpress.com',
	} ),
	new OpenTableFlow( {
		restaurant: 'Miku Restaurant - Vancouver',
	} ),
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

// We're just skipping the Payments Button test for now due to this bug:
// https://github.com/Automattic/jetpack/issues/30785
// You can't close the inserter, and it's just messing things up!
// // Stripe is not connected to this WordPress.com account, so skipping on Atomic
// if ( ! envVariables.TEST_ON_ATOMIC ) {
// 	blockFlows.push( new PaymentsBlockFlow( { buttonText: 'Donate to Me' } ) );
// }

// The Ad block is only available on more premium plans that imply AT.
// Furthermore, private sites are not eligible to monetize due to the site
// being, well, private.
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

createBlockTests( 'Blocks: Jetpack Earn', blockFlows );
