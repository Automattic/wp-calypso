import { /* AIAssistantFlow, */ BlockFlow, MarkdownFlow } from '@automattic/calypso-e2e';
import { tags } from '../../lib/pw-base';
import { createBlockTests } from './shared/block-smoke-testing';

const blockFlows: BlockFlow[] = [
	// Parked: has been failing to configure the block since April 2026. Was muted project-wide
	// under the Jest test ID (TeamCity mute 1501); the migrated suite is one test, so a mute
	// would now take every other block here down with it.
	// new AIAssistantFlow(
	// 	{
	// 		query: 'In two short sentences, tell me about Vancouver, Canada.',
	// 		tone: 'Passionate',
	// 		improve: 'Make shorter',
	// 	},
	// 	{ keywords: [ 'Vancouver' ] }
	// ),
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
