/**
 * @group gutenberg
 */

import {
	BlockFlow,
	DataHelper,
	LayoutGridBlockFlow,
	YouTubeBlockFlow,
} from '@automattic/calypso-e2e';
import { createBlockTests } from './shared/block-smoke-testing';

const blockFlows: BlockFlow[] = [
	new YouTubeBlockFlow( {
		embedUrl: 'https://www.youtube.com/watch?v=twGLN4lug-I',
		expectedVideoTitle: 'Getting Started on @wordpress-com',
	} ),
	new LayoutGridBlockFlow( {
		leftColumnText: DataHelper.getRandomPhrase(),
		rightColumnText: DataHelper.getRandomPhrase(),
	} ),
];

createBlockTests( 'Blocks: Core', blockFlows );
