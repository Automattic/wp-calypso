/**
 * @group gutenberg
 * @group jetpack-wpcom-integration
 */

import {
	InstagramBlockFlow,
	// TwitterBlockFlow,
	BlockFlow,
} from '@automattic/calypso-e2e';
import { createBlockTests } from './shared/block-smoke-testing';

const blockFlows: BlockFlow[] = [
	new InstagramBlockFlow( {
		embedUrl: 'https://www.instagram.com/p/BlDOZMil933/',
		expectedPostText: 'woocommerce',
	} ),
	// Skip Twitter embed test for now, upstream API is being too flaky.
	// p1730760290984869-slack-C07RS1SCKBK
	//new TwitterBlockFlow( {
	//	embedUrl: 'https://twitter.com/automattic/status/1360312228415700993',
	//	expectedTweetText: '@automattic',
	//} ),
];

createBlockTests( 'Blocks: Jetpack Extended Core Blocks', blockFlows );
