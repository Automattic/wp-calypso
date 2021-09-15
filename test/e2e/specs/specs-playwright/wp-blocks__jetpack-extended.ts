/**
 * @group gutenberg
 */

import { InstagramBlockFlow, TwitterBlockFlow, BlockFlow } from '@automattic/calypso-e2e';
import { createBlockTests } from './shared-specs/block-testing';

const blockFlows: BlockFlow[] = [
	new InstagramBlockFlow( {
		embedUrl: 'https://www.instagram.com/p/BlDOZMil933/',
		expectedPostText: 'woocommerce',
	} ),
	new TwitterBlockFlow( {
		embedUrl: 'https://twitter.com/automattic/status/1360312228415700993',
		expectedTweetText: '@automattic',
	} ),
];

createBlockTests( 'Core blocks extended by Jetpack', blockFlows );
