/**
 * @group gutenberg
 * @group jetpack-wpcom-integration
 */
import { BlockFlow, StarRatingBlock, MapFlow, GifFlow } from '@automattic/calypso-e2e';
import { createBlockTests } from './shared/block-smoke-testing';

const blockFlows: BlockFlow[] = [
	new StarRatingBlock( { rating: 3.5 } ),
	new MapFlow( { address: '1455 Quebec St, Vancouver, BC V6A 3Z7' } ),
	new GifFlow( { query: 'https://giphy.com/embed/MDJ9IbxxvDUQM' } ),
];

createBlockTests( 'Blocks: Other Jetpack Blocks', blockFlows );
