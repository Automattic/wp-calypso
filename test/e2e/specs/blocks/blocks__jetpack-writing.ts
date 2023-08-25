/**
 * @group gutenberg
 * @group jetpack-wpcom-integration
 */
import { BlockFlow, AIAssistantFlow } from '@automattic/calypso-e2e';
import { createBlockTests } from './shared/block-smoke-testing';

const blockFlows: BlockFlow[] = [
	new AIAssistantFlow( {
		query: 'In two short sentences, tell me about Vancouver, Canada.',
		tone: 'Passionate',
		improve: 'Make shorter',
		keywords: [ 'Vancouver' ],
	} ),
];

createBlockTests( 'Blocks: Jetpack Writing', blockFlows );
