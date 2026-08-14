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

	it( 'records supported response properties', () => {
		render(
			<ChatResponseRenderedTracker
				componentType="ai-editorial-review"
				toolId="jetpack_ai__show_component"
				responseTrackingProperties={ {
					suggested_edit_count: 2,
					conflict_count: 1,
					implication_count: 0,
					guideline_violation_count: 3,
					review_context: 'notes_and_guidelines',
				} }
			/>
		);

		expect( mockRecordBigSkyTracksEvent ).toHaveBeenCalledWith( 'chat_response_rendered', {
			component_type: 'ai-editorial-review',
			tool_id: 'jetpack_ai__show_component',
			suggested_edit_count: 2,
			conflict_count: 1,
			implication_count: 0,
			guideline_violation_count: 3,
			review_context: 'notes_and_guidelines',
		} );
	} );

	it( 'omits unsupported and invalid response properties', () => {
		render(
			<ChatResponseRenderedTracker
				componentType="ai-editorial-review"
				toolId="jetpack_ai__show_component"
				responseTrackingProperties={ {
					suggested_edit_count: -1,
					conflict_count: 1.5,
					implication_count: 2,
					review_context: 'unknown-context',
					private_text: 'do not record',
				} }
			/>
		);

		expect( mockRecordBigSkyTracksEvent ).toHaveBeenCalledWith( 'chat_response_rendered', {
			component_type: 'ai-editorial-review',
			tool_id: 'jetpack_ai__show_component',
			implication_count: 2,
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
