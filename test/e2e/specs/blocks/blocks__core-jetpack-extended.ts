/**
 * @group gutenberg
 * @group jetpack-wpcom-integration
 */

import { InstagramBlockFlow, BlockFlow } from '@automattic/calypso-e2e';
import { createBlockTests } from './shared/block-smoke-testing';

const blockFlows: BlockFlow[] = [
	new InstagramBlockFlow( {
		embedUrl: 'https://www.instagram.com/p/BlDOZMil933/',
		expectedPostText: 'woocommerce',
	} ),
];

createBlockTests( 'Blocks: Jetpack Extended Core Blocks', blockFlows );
