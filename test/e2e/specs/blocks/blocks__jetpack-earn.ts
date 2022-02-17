/**
 * @group gutenberg
 */
import {
	BlockFlow,
	PayWithPaypalBlockFlow,
	OpenTableFlow,
	PaymentsBlockFlow,
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
	new PaymentsBlockFlow( { buttonText: 'Donate to Me' } ),
];

createBlockTests( 'Blocks: Jetpack Earn', blockFlows );
