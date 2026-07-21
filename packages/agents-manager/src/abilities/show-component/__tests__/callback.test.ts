/**
 * @jest-environment jsdom
 */
import { setCheckpoint } from '../../../utils/checkpoint';
import { showComponentCallback } from '../callback';
import type { ShowComponentInput } from '../callback';

jest.mock( '../../../utils/checkpoint', () => ( {
	setCheckpoint: jest.fn(),
} ) );
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

	it( 'includes `followUpTasks` and `messageId` in the output', async () => {
		const result = await showComponentCallback(
			makeInput( { followUpTasks: true, messageId: 'msg-1' } )
		);

		const parsed = JSON.parse( result.agentMessage! );
		expect( parsed.data.followUpTasks ).toBe( true );
		expect( parsed.data.calypsoCheckpointId ).toBe( 'msg-1' );
	} );

	it( 'prefers `toolCallId` over `messageId` as the checkpoint ID', async () => {
		const result = await showComponentCallback(
			makeInput( { toolCallId: 'toolu_1', messageId: 'msg-1' } )
		);

		expect( setCheckpoint ).toHaveBeenCalledWith( 'toolu_1' );
		expect( JSON.parse( result.agentMessage! ).data.calypsoCheckpointId ).toBe( 'toolu_1' );
	} );

	it.each( [ 'color-picker', 'font-picker', 'button-picker' ] as const )(
		'sets a checkpoint for %s',
		async ( type ) => {
			await showComponentCallback( makeInput( { type, messageId: 'msg-1' } ) );
			expect( setCheckpoint ).toHaveBeenCalledWith( 'msg-1' );
		}
	);

	it( 'does not set checkpoint when no checkpoint ID is available', async () => {
		await showComponentCallback( makeInput() );
		expect( setCheckpoint ).not.toHaveBeenCalled();
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
