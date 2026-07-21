import { AIAssistantFlow, BlockFlow, MarkdownFlow } from '@automattic/calypso-e2e';
import { tags } from '../../lib/pw-base';
import { createBlockTests } from './shared/block-smoke-testing';

const blockFlows: BlockFlow[] = [
	new AIAssistantFlow(
		{
			query: 'In two short sentences, tell me about Vancouver, Canada.',
			tone: 'Passionate',
			improve: 'Make shorter',
		},
		{ keywords: [ 'Vancouver' ] }
	),
	new MarkdownFlow(
		{
			text: '### Markdown Header',
		},
		{
			expectedText: 'Markdown Header',
			expectedRole: 'heading',
		}
	),
];

createBlockTests( 'Blocks: Jetpack Writing', blockFlows, [
	tags.GUTENBERG,
	tags.JETPACK_WPCOM_INTEGRATION,
] );
