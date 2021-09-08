import { InstagramBlockFlow, BlockFlow } from '@automattic/calypso-e2e';
import { createBlockTests } from './shared-specs/block-testing';

const blockFlows: BlockFlow[] = [
	new InstagramBlockFlow( {
		embedUrl: 'https://www.instagram.com/p/BlDOZMil933/',
		expectedPostText: 'woocommerce',
	} ),
];

createBlockTests( 'Core blocks extended by Jetpack', blockFlows );
