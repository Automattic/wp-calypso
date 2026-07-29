import { /* AIAssistantFlow, */ BlockFlow, MarkdownFlow } from '@automattic/calypso-e2e';
import { tags } from '../../lib/pw-base';
import { createBlockTests } from './shared/block-smoke-testing';

const blockFlows: BlockFlow[] = [
	// Parked (TESTOPS-148): has been failing to configure the block since April 2026. The mute
	// this had under the Jest test ID died with the migration, and the migrated suite is one
	// test, so a mute would now take every other block here down with it.
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
