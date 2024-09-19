/**
 * @group gutenberg
 * @group jetpack-wpcom-integration
 */
import {
	AllFormFieldsFlow,
	BlockFlow,
	ContactFormFlow,
	FormAiFlow,
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
		},
		{
			otherExpectedFields: [
				{ type: 'textbox', accessibleName: 'Name' },
				{ type: 'textbox', accessibleName: 'Email' },
			],
		}
	),
	new FormAiFlow( {
		prompt:
			// The prefix part of the prompt isn't necessary for the test to be stable and have value
			// but it doesn't hurt and will make debugging easier!
			'Please create a small and simple registration form for a conference. Please prefix all field labels and the submit button with "AI:".',
	} ),
];

createBlockTests( 'Blocks: Jetpack Forms', blockFlows );
