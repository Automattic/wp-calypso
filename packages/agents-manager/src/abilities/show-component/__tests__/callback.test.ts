/**
 * @jest-environment jsdom
 */
import { setCheckpoint } from '../../../utils/checkpoints';
import { getToolCallIdFromConversationHistory } from '../../../utils/tool-call-history';
import { showComponentCallback } from '../callback';
import type { ShowComponentInput } from '../callback';

jest.mock( '@wordpress/data', () => ( {
	select: () => ( { getCurrentPostId: () => 42 } ),
} ) );
jest.mock( '../../../utils/checkpoints', () => ( {
	checkpointKeys: { COLOR: 'color', FONT: 'font', BUTTON: 'button' },
	setCheckpoint: jest.fn(),
} ) );
jest.mock( '../../../utils/tool-call-history', () => ( {
	getToolCallIdFromConversationHistory: jest.fn( () => null ),
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

	it( 'falls back to the default message for a non-string summary', async () => {
		const result = await showComponentCallback( makeInput( { summary: 5 as unknown as string } ) );

		expect( result.result.message ).toBe( 'Choose from the options I provided.' );
	} );

	it( 'includes `followUpTasks` in the output', async () => {
		const result = await showComponentCallback( makeInput( { followUpTasks: true } ) );

		expect( JSON.parse( result.agentMessage! ).data.followUpTasks ).toBe( true );
	} );

	it.each( [
		[ 'color-picker', [ 'color' ] ],
		[ 'font-picker', [ 'font' ] ],
		[ 'button-picker', [ 'button' ] ],
	] as const )( 'checkpoints the pre-pick state for %s', async ( type, keys ) => {
		jest.mocked( getToolCallIdFromConversationHistory ).mockReturnValueOnce( 'toolu_9' );

		await showComponentCallback( makeInput( { type } ) );

		expect( setCheckpoint ).toHaveBeenCalledWith( 'toolu_9', keys, {
			toolId: 'big_sky__show_component',
			summary: 'Choose from the options I provided.',
		} );
	} );

	it( 'skips the checkpoint when the tool call id is unknown', async () => {
		await showComponentCallback( makeInput() );

		expect( setCheckpoint ).not.toHaveBeenCalled();
	} );

	it( 'skips the checkpoint for an unknown component type', async () => {
		jest.mocked( getToolCallIdFromConversationHistory ).mockReturnValueOnce( 'toolu_9' );

		await showComponentCallback(
			makeInput( { type: 'pattern-picker' as ShowComponentInput[ 'type' ] } )
		);

		expect( setCheckpoint ).not.toHaveBeenCalled();
	} );

	it( 'returns a structured error result when props is null', async () => {
		const result = await showComponentCallback(
			makeInput( { props: null as unknown as ShowComponentInput[ 'props' ] } )
		);

		expect( result.result.success ).toBe( false );
		expect( result.agentMessage ).toBeUndefined();
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
