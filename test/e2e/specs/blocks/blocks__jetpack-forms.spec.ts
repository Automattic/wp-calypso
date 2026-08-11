import {
	AllFormFieldsFlow,
	BlockFlow,
	ContactFormFlow,
	FormAiFlow,
	FormPatternsFlow,
	RestAPIClient,
	TestAccount,
	envVariables,
	envToFeatureKey,
	getTestAccountByFeature,
} from '@automattic/calypso-e2e';
import { tags, test } from '../../lib/pw-base';
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
			'Please create a small and simple registration form for a conference. Please prefix all field labels and the submit button with "AI:".',
	} ),
];

// The Form block only renders its AI prompt while Jetpack's `ai` module is active. Off Simple that
// module is the site-wide AI master switch, and it is auto-activated on plugin upgrade only, which
// never happens on sites whose Jetpack version does not change between builds. Simple keeps the
// `jetpack_ai_enabled` option as its master and exposes no module endpoint, so it is left alone.
test.beforeAll( async () => {
	if ( ! envVariables.TEST_ON_ATOMIC ) {
		return;
	}

	const testAccount = new TestAccount( getTestAccountByFeature( envToFeatureKey( envVariables ) ) );
	const restAPIClient = new RestAPIClient( testAccount.credentials );

	// An already-active module answers with an error-shaped body, and a failed activation shows up as
	// the missing AI prompt, so the response is of no use here.
	await restAPIClient.sendRequest(
		restAPIClient.getRequestURL(
			'1.1',
			`/jetpack-blogs/${ testAccount.credentials.testSites?.primary.id }/rest-api/`
		),
		{
			method: 'post',
			headers: {
				Authorization: await restAPIClient.getAuthorizationHeader( 'bearer' ),
				'Content-Type': 'application/json',
			},
			body: JSON.stringify( {
				path: '/jetpack/v4/module/ai/active/',
				body: JSON.stringify( { active: true } ),
			} ),
		}
	);
} );

createBlockTests( 'Blocks: Jetpack Forms', blockFlows, [
	tags.GUTENBERG,
	tags.JETPACK_WPCOM_INTEGRATION,
] );
