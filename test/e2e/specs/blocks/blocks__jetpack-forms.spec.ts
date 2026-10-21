import {
	AllFormFieldsFlow,
	BlockFlow,
	ContactFormFlow,
	FormAiFlow,
	FormPatternsFlow,
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
// module is the site-wide AI switch, and it is auto-activated on plugin upgrade only, which never
// happens on sites whose Jetpack version does not change between builds. Simple keeps the
// `jetpack_ai_enabled` option as its switch and exposes no module endpoint, so it is left alone.
test.beforeAll( async () => {
	const features = envToFeatureKey( envVariables );

	// Remote (self-hosted) Jetpack sites are classified as atomic and need the same activation.
	if ( features.siteType !== 'atomic' ) {
		return;
	}

	const testAccount = new TestAccount( getTestAccountByFeature( features ) );
	const restAPIClient = testAccount.restAPI;

	// Activation is best-effort: the block flows that do not use AI must still run if WordPress.com
	// is unreachable. The outcome is logged instead, as an already-active module also answers with
	// an error-shaped body and cannot be told apart from a refusal.
	try {
		const authorization = await restAPIClient.getAuthorizationHeader( 'bearer' );
		// The site the suite edits, resolved the same way, as the account secrets may hold others.
		const siteSlug = testAccount.getSiteURL( { protocol: false } );
		const site = await restAPIClient.sendRequest(
			restAPIClient.getRequestURL( '1.1', `/sites/${ siteSlug }` ),
			{ method: 'get', headers: { Authorization: authorization } }
		);

		if ( ! site?.ID ) {
			throw new Error( `No site ID for ${ siteSlug }: ${ JSON.stringify( site ) }` );
		}

		const response = await restAPIClient.sendRequest(
			restAPIClient.getRequestURL( '1.1', `/jetpack-blogs/${ site.ID }/rest-api/` ),
			{
				method: 'post',
				headers: {
					Authorization: authorization,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify( {
					path: '/jetpack/v4/module/ai/active/',
					body: JSON.stringify( { active: true } ),
				} ),
			}
		);

		console.info(
			`Jetpack AI module activation on ${ siteSlug }: ${ JSON.stringify( response ) }`
		);
	} catch ( error ) {
		console.warn( `Jetpack AI module activation failed: ${ error }` );
	}
} );

createBlockTests( 'Blocks: Jetpack Forms', blockFlows, [
	tags.GUTENBERG,
	tags.JETPACK_WPCOM_INTEGRATION,
] );
