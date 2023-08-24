/**
 * @group gutenberg
 * @group jetpack-wpcom-integration
 */
import { AllFormFieldsFlow, BlockFlow } from '@automattic/calypso-e2e';
import { createBlockTests } from './shared/block-smoke-testing';

const blockFlows: BlockFlow[] = [
	new AllFormFieldsFlow( {
		labelPrefix: 'All Fields',
	} ),
];

createBlockTests( 'Blocks: Jetpack Forms', blockFlows );
