import {
	BlockFlow,
	envVariables,
	// GifFlow,
	MapFlow,
	RelatedPostsFlow,
	StarRatingBlock,
} from '@automattic/calypso-e2e';
import { tags } from '../../lib/pw-base';
import { createBlockTests } from './shared/block-smoke-testing';

const blockFlows: BlockFlow[] = [
	new StarRatingBlock( { rating: 3.5 } ),
	// Parked (TESTOPS-148): giphy changed the content of their embed, so the flow can no longer
	// find the player. The mute this had under the Jest test ID died with the migration, and the
	// migrated suite is one test, so a mute would now take every other block here down with it.
	// new GifFlow( { query: 'https://giphy.com/embed/MDJ9IbxxvDUQM' } ),
];

// Private sites change behavior of the Map block.
// @see: https://github.com/Automattic/jetpack/issues/32991
// Related posts block do not show up on private sites, as one would expect.
if ( envVariables.ATOMIC_VARIATION !== 'private' ) {
	blockFlows.push(
		new MapFlow( { address: '1455 Quebec Street, Vancouver', select: '1455 Quebec St' } )
	);
	blockFlows.push(
		new RelatedPostsFlow( {
			headline: 'Related Posts from this user',
		} )
	);
}

createBlockTests( 'Blocks: Other Jetpack Blocks', blockFlows, [
	tags.GUTENBERG,
	tags.JETPACK_WPCOM_INTEGRATION,
] );
