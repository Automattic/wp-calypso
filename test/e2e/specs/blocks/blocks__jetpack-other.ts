/**
 * @group gutenberg
 * @group jetpack-wpcom-integration
 */
import {
	BlockFlow,
	StarRatingBlock,
	MapFlow,
	GifFlow,
	envVariables,
	RelatedPostsFlow,
} from '@automattic/calypso-e2e';
import { createBlockTests } from './shared/block-smoke-testing';

const blockFlows: BlockFlow[] = [
	new StarRatingBlock( { rating: 3.5 } ),
	new GifFlow( { query: 'https://giphy.com/embed/MDJ9IbxxvDUQM' } ),
];

// Private sites change behaivor of the Map block.
// @see: https://github.com/Automattic/jetpack/issues/32991
// Related posts block do not show up on private sites, as one would expect.
if ( envVariables.ATOMIC_VARIATION !== 'private' ) {
	blockFlows.push(
		new MapFlow( { address: '1455 Quebec Street, Vancouver', select: '1455 Quebec St' } )
	);
	blockFlows.push(
		new RelatedPostsFlow( {
			headline: `Related Posts from this user`,
		} )
	);
}

createBlockTests( 'Blocks: Other Jetpack Blocks', blockFlows );
