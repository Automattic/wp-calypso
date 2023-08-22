/**
 * @group gutenberg
 * @group jetpack-wpcom-integration
 */
import {
	BlockFlow,
	PayWithPaypalBlockFlow,
	OpenTableFlow,
	AIAssistantFlow,
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
	new AIAssistantFlow( {
		query: 'In three sentences, tell me about Vancouver, Canada.',
		tone: 'Passionate',
		improve: 'Make shorter',
	} ),
];

// We're just skipping the Payments Button test for now due to this bug:
// https://github.com/Automattic/jetpack/issues/30785
// You can't close the inserter, and it's just messing things up!
// // Stripe is not connected to this WordPress.com account, so skipping on Atomic
// if ( ! envVariables.TEST_ON_ATOMIC ) {
// 	blockFlows.push( new PaymentsBlockFlow( { buttonText: 'Donate to Me' } ) );
// }

createBlockTests( 'Blocks: Jetpack Earn', blockFlows );
