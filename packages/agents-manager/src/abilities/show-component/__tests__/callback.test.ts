/**
 * @jest-environment jsdom
 */
import { hasCheckpoint, setCheckpoint } from '../../../utils/checkpoints';
import { getToolCallIdFromConversationHistory } from '../../../utils/tool-call-history';
import { showComponentCallback } from '../callback';
import { jetpackAiShowComponentAbility, showComponentAbility } from '../index';
import type { ShowComponentInput } from '../callback';

jest.mock( '@wordpress/data', () => ( {
	select: () => ( { getCurrentPostId: () => 42 } ),
} ) );
jest.mock( '../../../utils/checkpoints', () => ( {
	checkpointKeys: {
		COLOR: 'color',
		FONT: 'font',
		BUTTON: 'button',
		POST_TITLE: 'post_title',
		POST_EXCERPT: 'post_excerpt',
	},
	hasCheckpoint: jest.fn( () => false ),
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

	it( 'keeps an existing snapshot instead of overwriting it', async () => {
		jest.mocked( getToolCallIdFromConversationHistory ).mockReturnValueOnce( 'toolu_9' );
		jest.mocked( hasCheckpoint ).mockReturnValueOnce( true );

		await showComponentCallback( makeInput() );

		expect( setCheckpoint ).not.toHaveBeenCalled();
	} );

	it( 'skips the checkpoint and the history scan for an unknown component type', async () => {
		await showComponentCallback( makeInput( { type: 'pattern-picker' } ) );

		expect( getToolCallIdFromConversationHistory ).not.toHaveBeenCalled();
		expect( setCheckpoint ).not.toHaveBeenCalled();
	} );

	it.each( [
		[ 'title-picker', [ 'post_title' ] ],
		[ 'excerpt-picker', [ 'post_excerpt' ] ],
	] )( 'checkpoints the post field %s writes', async ( type, keys ) => {
		await showComponentCallback(
			makeInput( { type, toolCallId: 'toolu_9', props: { titles: [ { title: 'A' } ] } } )
		);

		expect( setCheckpoint ).toHaveBeenCalledWith( 'toolu_9', keys, {
			toolId: 'big_sky__show_component',
			summary: 'Choose from the options I provided.',
		} );
	} );

	it( 'keys the checkpoint by the call id it is given, and echoes it', async () => {
		const result = await showComponentCallback( makeInput( { toolCallId: 'toolu_7' } ) );

		expect( getToolCallIdFromConversationHistory ).not.toHaveBeenCalled();
		expect( setCheckpoint ).toHaveBeenCalledWith( 'toolu_7', [ 'color' ], expect.any( Object ) );
		expect( JSON.parse( result.agentMessage! ).tool_call_id ).toBe( 'toolu_7' );
	} );

	it( 'echoes the call id for a type it does not checkpoint', async () => {
		const result = await showComponentCallback(
			makeInput( { type: 'proofread', toolCallId: 'toolu_7', props: { summary: 'Two typos.' } } )
		);

		expect( setCheckpoint ).not.toHaveBeenCalled();
		expect( JSON.parse( result.agentMessage! ).tool_call_id ).toBe( 'toolu_7' );
	} );

	it( 'passes the tracking properties through to the picker message', async () => {
		const responseTrackingProperties = { suggested_edit_count: 2 };

		const result = await showComponentCallback( makeInput( { responseTrackingProperties } ) );

		expect( JSON.parse( result.agentMessage! ).data.responseTrackingProperties ).toEqual(
			responseTrackingProperties
		);
	} );

	it( 'logs and returns an error result when showing the component throws', async () => {
		const error = jest.spyOn( console, 'error' ).mockImplementation( () => {} );
		jest.mocked( getToolCallIdFromConversationHistory ).mockReturnValueOnce( 'toolu_9' );
		jest.mocked( setCheckpoint ).mockImplementationOnce( () => {
			throw new Error( 'Snapshot exploded.' );
		} );

		const result = await showComponentCallback( makeInput() );

		expect( result.result ).toMatchObject( { success: false, error: 'Snapshot exploded.' } );
		expect( result.agentMessage ).toBeUndefined();
		expect( error ).toHaveBeenCalledWith(
			'[AgentsManager] Error showing component color-picker:',
			expect.any( Error )
		);
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

describe( 'jetpackAiShowComponentAbility', () => {
	it( 'is the same ability under the Jetpack name, and still emits the Big Sky id', async () => {
		const result = ( await jetpackAiShowComponentAbility.callback!(
			makeInput( { toolCallId: 'toolu_3' } )
		) ) as Awaited< ReturnType< typeof showComponentCallback > >;

		expect( jetpackAiShowComponentAbility.name ).toBe( 'jetpack-ai/show-component' );
		expect( jetpackAiShowComponentAbility.callback ).toBe( showComponentAbility.callback );
		expect( JSON.parse( result.agentMessage! ) ).toMatchObject( {
			tool_id: 'big_sky__show_component',
			tool_call_id: 'toolu_3',
		} );
	} );
} );
