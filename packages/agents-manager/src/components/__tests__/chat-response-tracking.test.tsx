import { render } from '@testing-library/react';
import * as tracks from '../../utils/tracks';
import ChatResponseRenderedTracker, {
	createChatResponseActionCallback,
} from '../chat-response-tracking';

let mockRecordBigSkyTracksEvent: jest.SpiedFunction< typeof tracks.recordBigSkyTracksEvent >;

beforeEach( () => {
	mockRecordBigSkyTracksEvent = jest
		.spyOn( tracks, 'recordBigSkyTracksEvent' )
		.mockImplementation( () => undefined );
} );

afterEach( () => {
	mockRecordBigSkyTracksEvent.mockRestore();
} );

afterAll( () => {
	// This suite imports the real Tracks module before spying on it. Clear that
	// module instance so later suites can install their own module-level mocks.
	jest.resetModules();
} );

describe( 'ChatResponseRenderedTracker', () => {
	it( 'records the known response identifiers once', () => {
		const { rerender } = render(
			<ChatResponseRenderedTracker
				componentType="title-picker"
				toolId="jetpack_ai__show_component"
				toolCallId="tool-call-1"
			/>
		);

		expect( mockRecordBigSkyTracksEvent ).toHaveBeenCalledWith( 'chat_response_rendered', {
			component_type: 'title-picker',
			tool_id: 'jetpack_ai__show_component',
			tool_call_id: 'tool-call-1',
		} );

		rerender(
			<ChatResponseRenderedTracker
				componentType="title-picker"
				toolId="jetpack_ai__show_component"
				toolCallId="tool-call-1"
			/>
		);

		expect( mockRecordBigSkyTracksEvent ).toHaveBeenCalledTimes( 1 );

		rerender(
			<ChatResponseRenderedTracker
				componentType="title-picker"
				toolId="jetpack_ai__show_component"
				toolCallId="tool-call-2"
			/>
		);

		expect( mockRecordBigSkyTracksEvent ).toHaveBeenCalledTimes( 2 );
		expect( mockRecordBigSkyTracksEvent ).toHaveBeenLastCalledWith( 'chat_response_rendered', {
			component_type: 'title-picker',
			tool_id: 'jetpack_ai__show_component',
			tool_call_id: 'tool-call-2',
		} );
	} );

	it( 'omits an unavailable tool call id', () => {
		render(
			<ChatResponseRenderedTracker componentType="proofread" toolId="jetpack_ai__show_component" />
		);

		expect( mockRecordBigSkyTracksEvent ).toHaveBeenCalledWith( 'chat_response_rendered', {
			component_type: 'proofread',
			tool_id: 'jetpack_ai__show_component',
		} );
	} );
} );

describe( 'createChatResponseActionCallback', () => {
	it( 'records the action with response identifiers and aggregate item count', () => {
		const onResponseAction = createChatResponseActionCallback( {
			componentType: 'proofread',
			toolId: 'jetpack_ai__show_component',
			toolCallId: 'tool-call-1',
		} );

		onResponseAction( {
			action: 'bulk_accept',
			target: 'edit',
			outcome: 'partial_failed',
			itemCount: 3,
		} );

		expect( mockRecordBigSkyTracksEvent ).toHaveBeenCalledWith( 'chat_response_action', {
			component_type: 'proofread',
			tool_id: 'jetpack_ai__show_component',
			tool_call_id: 'tool-call-1',
			action: 'bulk_accept',
			target: 'edit',
			outcome: 'partial_failed',
			item_count: 3,
		} );
	} );

	it( 'omits unavailable optional properties', () => {
		const onResponseAction = createChatResponseActionCallback( {
			componentType: 'title-picker',
			toolId: 'jetpack_ai__show_component',
		} );

		onResponseAction( { action: 'accept', target: 'option', outcome: 'success' } );

		expect( mockRecordBigSkyTracksEvent ).toHaveBeenCalledWith( 'chat_response_action', {
			component_type: 'title-picker',
			tool_id: 'jetpack_ai__show_component',
			action: 'accept',
			target: 'option',
			outcome: 'success',
		} );
	} );
} );
