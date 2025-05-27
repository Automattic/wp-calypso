import { deprecatedV1Flows } from '../registered-flows';

const frozenDeprecatedV1Flows = [
	'site-setup',
	'copy-site',
	'newsletter',
	'entrepreneur',
	'readymade-template',
	'update-design',
	'update-options',
	'domain-upsell',
	'build',
	'write',
	'start-writing',
	'connect-domain',
	'transferring-hosted-site',
	'domain-transfer',
	'google-transfer',
	'plugin-bundle',
	'hundred-year-plan',
	'domain-user-transfer',
	'reblogging',
];

describe( 'Deprecated Flows', () => {
	it( 'No new FlowV1 flows should be added as V1', () => {
		const deprecatedV1FlowsKeys = Object.keys( deprecatedV1Flows );
		const frozenDeprecatedV1FlowsKeys = frozenDeprecatedV1Flows;

		const difference = deprecatedV1FlowsKeys.filter(
			( x ) => ! frozenDeprecatedV1FlowsKeys.includes( x )
		);

		if ( difference.length > 0 ) {
			throw new Error(
				`Please use FlowV2 instead. Detected new V1 flows: ${ difference.join( ', ' ) }`
			);
		}
		expect( difference ).toEqual( [] );
	} );
} );
