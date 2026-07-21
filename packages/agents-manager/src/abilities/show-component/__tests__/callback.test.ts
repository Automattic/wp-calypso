/**
 * @jest-environment jsdom
 */
import { showComponentCallback } from '../callback';
import type { ShowComponentInput } from '../callback';

jest.mock( '@wordpress/data', () => ( {
	select: () => ( { getCurrentPostId: () => 42 } ),
} ) );

const makeInput = ( overrides: Partial< ShowComponentInput > = {} ): ShowComponentInput => ( {
	type: 'color-picker',
	props: { variations: [ { title: 'Bold' } ] },
	...overrides,
} );

beforeEach( () => jest.clearAllMocks() );

describe( 'showComponentCallback', () => {
	it( 'returns a successful `agentMessage` with correct structure', async () => {
		const result = await showComponentCallback( makeInput() );

		expect( result.result ).toEqual( {
			success: true,
			message: 'Choose from the options I provided.',
			details: { type: 'color-picker' },
		} );
		expect( result.returnToAgent ).toBe( true );

		const parsed = JSON.parse( result.agentMessage! );
		expect( parsed.tool_id ).toBe( 'big_sky__show_component' );
		expect( parsed.data ).toMatchObject( {
			type: 'color-picker',
			props: { variations: [ { title: 'Bold' } ] },
			summary: 'Choose from the options I provided.',
			isCurrent: true,
			postId: 42,
		} );
	} );

	it( 'uses the input `summary` as the success message and picker summary', async () => {
		const result = await showComponentCallback( makeInput( { summary: 'Pick a color palette.' } ) );

		expect( result.result.message ).toBe( 'Pick a color palette.' );
		expect( JSON.parse( result.agentMessage! ).data.summary ).toBe( 'Pick a color palette.' );
	} );

	it( 'includes `followUpTasks` in the output', async () => {
		const result = await showComponentCallback( makeInput( { followUpTasks: true } ) );

		expect( JSON.parse( result.agentMessage! ).data.followUpTasks ).toBe( true );
	} );

	it( 'returns a structured error result when props is empty', async () => {
		const result = await showComponentCallback( makeInput( { props: {} } ) );

		expect( result.result.success ).toBe( false );
		expect( result.result.message ).toBe(
			'There was an error with this request. Please try again.'
		);
		expect( result.result.error ).toContain( 'Props must be an object with properties' );
		expect( result.returnToAgent ).toBe( true );
		expect( result.agentMessage ).toBeUndefined();
	} );
} );
