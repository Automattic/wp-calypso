import { BlockFlow, MarkdownFlow } from '@automattic/calypso-e2e';
import { tags } from '../../lib/pw-base';
import { createBlockTests } from './shared/block-smoke-testing';

// AIAssistantFlow dropped (TESTOPS-148): it has been failing to configure the block since April
// 2026. Its Jest-era mute died with the migration, and the suite is now a single test, so a mute
// would take every other block here down with it.
const blockFlows: BlockFlow[] = [
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
