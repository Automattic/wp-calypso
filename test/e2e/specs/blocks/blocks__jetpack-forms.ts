/**
 * @group gutenberg
 * @group jetpack-wpcom-integration
 */
import {
	AllFormFieldsFlow,
	BlockFlow,
	ContactFormFlow,
	FormPatternsFlow,
} from '@automattic/calypso-e2e';
import { createBlockTests } from './shared/block-smoke-testing';

const blockFlows: BlockFlow[] = [
	new AllFormFieldsFlow( {
		labelPrefix: 'All Fields',
	} ),
	new ContactFormFlow( {
		labelPrefix: 'Contact Form',
	} ),
	new FormPatternsFlow(
		{
			labelPrefix: 'Form Patterns',
			patternName: 'RSVP Form',
		},
		{
			otherExpectedFields: [
				{ type: 'radio', accessibleName: 'Yes' },
				{ type: 'radio', accessibleName: 'No' },
				{ type: 'button', accessibleName: 'Send RSVP' },
			],
		}
	),
];

createBlockTests( 'Blocks: Jetpack Forms', blockFlows );
