import {
	BlockFlow,
	BlogPostsBlockFlow,
	DataHelper,
	PostCarouselBlockFlow,
	TimelineBlockFlow,
} from '@automattic/calypso-e2e';
import { tags } from '../../lib/pw-base';
import { createBlockTests } from './shared/block-smoke-testing';

const blockFlows: BlockFlow[] = [
	new BlogPostsBlockFlow(),
	new PostCarouselBlockFlow(),
	new TimelineBlockFlow( {
		firstEntry: DataHelper.getRandomPhrase(),
		secondEntry: DataHelper.getRandomPhrase(),
	} ),
];

createBlockTests( 'Blocks: ETK', blockFlows, [ tags.GUTENBERG ] );
