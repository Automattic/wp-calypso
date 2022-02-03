/**
 * @group gutenberg
 */
import {
	BlockFlow,
	BlogPostsBlockFlow,
	PostCarouselBlockFlow,
	TimelineBlockFlow,
	DataHelper,
} from '@automattic/calypso-e2e';
import { createBlockTests } from '../specs-playwright/shared-specs/block-testing';

const blockFlows: BlockFlow[] = [
	new BlogPostsBlockFlow(),
	new PostCarouselBlockFlow(),
	new TimelineBlockFlow( {
		firstEntry: DataHelper.getRandomPhrase(),
		secondEntry: DataHelper.getRandomPhrase(),
	} ),
];

createBlockTests( 'Blocks: ETK', blockFlows );
