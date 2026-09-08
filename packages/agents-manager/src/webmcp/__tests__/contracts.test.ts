import {
	APPLY_BLOCK_EDITS_WEBMCP_INPUT_SCHEMA,
	getWebMcpDescription,
	getWebMcpInputSchema,
	normalizeInputSchema,
} from '../contracts';
import type { Ability } from '../../abilities/types';

jest.mock( '@wordpress/blocks', () => ( { parse: jest.fn() } ) );

const createAbility = ( overrides: Partial< Ability > = {} ): Ability => ( {
	name: 'other-plugin/get-site-health',
	label: 'Get site health',
	description: 'Read the site health summary.',
	category: 'other-plugin',
	input_schema: { type: 'object', properties: { verbose: { type: 'boolean' } } },
	meta: { annotations: { serverRegistered: true, readonly: true } },
	...overrides,
} );

describe( 'WebMCP contracts', () => {
	it( 'normalizes missing and malformed input schemas', () => {
		expect( normalizeInputSchema( undefined ) ).toEqual( { type: 'object', properties: {} } );
		expect( normalizeInputSchema( 'invalid' ) ).toEqual( { type: 'object', properties: {} } );
		expect( normalizeInputSchema( [] ) ).toEqual( { type: 'object', properties: {} } );
		expect( normalizeInputSchema( { properties: { value: { type: 'string' } } } ) ).toEqual( {
			properties: { value: { type: 'string' } },
			type: 'object',
		} );
		expect( normalizeInputSchema( { anyOf: [ { type: 'string' } ] } ) ).toEqual( {
			anyOf: [ { type: 'string' } ],
		} );
		expect( normalizeInputSchema( { oneOf: [ { type: 'number' } ] } ) ).toEqual( {
			oneOf: [ { type: 'number' } ],
		} );
	} );

	it( 'uses the ability schema unless a contract overrides it', () => {
		const ability = createAbility();
		expect( getWebMcpInputSchema( ability ) ).toBe( ability.input_schema );
		expect( getWebMcpInputSchema( createAbility( { name: 'big-sky/apply-block-edits' } ) ) ).toBe(
			APPLY_BLOCK_EDITS_WEBMCP_INPUT_SCHEMA
		);
	} );

	it( 'appends server instructions to any ability that carries them', () => {
		expect( getWebMcpDescription( createAbility() ) ).toBe( 'Read the site health summary.' );
		expect(
			getWebMcpDescription(
				createAbility( {
					meta: { instructions: 'Call sparingly.', annotations: { serverRegistered: true } },
				} )
			)
		).toBe( 'Read the site health summary.\n\nCall sparingly.' );
		expect( getWebMcpDescription( createAbility( { description: '', label: '' } ) ) ).toBe(
			'other-plugin/get-site-health'
		);
	} );

	it( 'lets a contract description replace the ability text entirely', () => {
		expect(
			getWebMcpDescription(
				createAbility( { name: 'big-sky/show-template', meta: { instructions: 'ignored' } } )
			)
		).toContain( 'agents_manager__get_block_tree' );
	} );
} );
