/**
 * @group gutenberg
 * @group jetpack-wpcom-integration
 */
import { BlockFlow, StarRatingBlock, MapFlow } from '@automattic/calypso-e2e';
import { createBlockTests } from './shared/block-smoke-testing';

const blockFlows: BlockFlow[] = [
	new StarRatingBlock( { rating: 3.5 } ),
	new MapFlow( { address: '1455 Quebec St, Vancouver, BC V6A 3Z7' } ),
];

createBlockTests( 'Blocks: Other Jetpack Blocks', blockFlows );
