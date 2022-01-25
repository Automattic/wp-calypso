/**
 * @group gutenberg
 */
import { BlockFlow, PayWithPaypalBlockFlow } from '@automattic/calypso-e2e';
import { createBlockTests } from '../specs-playwright/shared-specs/block-testing';

const blockFlows: BlockFlow[] = [
	new PayWithPaypalBlockFlow( {
		name: 'Test Paypal Block',
		price: 900,
		email: 'test@wordpress.com',
	} ),
];

createBlockTests( 'Blocks: Jetpack Earn', blockFlows );
