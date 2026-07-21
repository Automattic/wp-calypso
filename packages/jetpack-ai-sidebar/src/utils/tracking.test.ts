/**
 * @jest-environment jsdom
 */

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	trackAiEditorialReviewItemAction,
	trackAiEditorialReviewResultRendered,
	trackAiEditorialReviewSuggestionRendered,
	trackBlockTransformationSuggestionRendered,
} from './tracking';

const mockedRecordTracksEvent = recordTracksEvent as jest.MockedFunction<
	typeof recordTracksEvent
>;

const expectPrivacySafePayload = ( properties: Record< string, unknown > ) => {
	expect( properties ).not.toHaveProperty( 'post_id' );
	expect( properties ).not.toHaveProperty( 'post_type' );
	expect( properties ).not.toHaveProperty( 'block_index' );
	expect( properties ).not.toHaveProperty( 'run_id' );
	expect( properties ).not.toHaveProperty( 'client_run_id' );
	expect( properties ).not.toHaveProperty( 'trigger' );
	expect( properties ).not.toHaveProperty( 'cache_hit' );
	expect( properties ).not.toHaveProperty( 'auto_suggested_edit_count' );
	expect( properties ).not.toHaveProperty( 'manual_suggested_edit_count' );
	expect( properties ).not.toHaveProperty( 'success_count' );
	expect( properties ).not.toHaveProperty( 'failure_count' );
	expect( properties ).not.toHaveProperty( 'text' );
	expect( properties ).not.toHaveProperty( 'prompt' );
	expect( properties ).not.toHaveProperty( 'label' );
	expect( properties ).not.toHaveProperty( 'client_id' );
	expect( properties ).not.toHaveProperty( 'clientId' );
	expect( properties ).not.toHaveProperty( 'content' );
	expect( properties ).not.toHaveProperty( 'reviewer' );
};

type WindowWithAgentsManagerActions = Window & {
	__agentsManagerActions?: {
		getSessionId?: () => string;
	};
};

describe( 'AI Editorial Review tracking', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		( window as WindowWithAgentsManagerActions ).__agentsManagerActions = {
			getSessionId: jest.fn( () => 'test-session-id' ),
		};
	} );

	afterEach( () => {
		delete ( window as WindowWithAgentsManagerActions ).__agentsManagerActions;
	} );

	it( 'tracks suggestion exposure with only session context', () => {
		trackAiEditorialReviewSuggestionRendered();

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'jetpack_ai_editorial_review_suggestion_rendered',
			{
				sessionid: 'test-session-id',
			}
		);
		expectPrivacySafePayload( mockedRecordTracksEvent.mock.calls[ 0 ][ 1 ] );
	} );

	it( 'tracks rendered results as aggregate usefulness counts', () => {
		trackAiEditorialReviewResultRendered( {
			outcome: 'success',
			conflictCount: 2,
			implicationCount: 3,
			suggestedEditCount: 8,
			guidelineViolationCount: 0,
			reviewContext: 'notes_and_guidelines',
		} );

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'jetpack_ai_editorial_review_result_rendered',
			{
				outcome: 'success',
				conflict_count: 2,
				implication_count: 3,
				suggested_edit_count: 8,
				guideline_violation_count: 0,
				review_context: 'notes_and_guidelines',
				sessionid: 'test-session-id',
			}
		);
		expectPrivacySafePayload( mockedRecordTracksEvent.mock.calls[ 0 ][ 1 ] );
	} );

	it( 'tracks item actions after completion without row identifiers', () => {
		trackAiEditorialReviewItemAction( {
			action: 'bulk_accept',
			target: 'mixed',
			outcome: 'partial_failed',
			itemCount: 4,
		} );

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'jetpack_ai_editorial_review_item_action',
			{
				action: 'bulk_accept',
				target: 'mixed',
				outcome: 'partial_failed',
				item_count: 4,
				sessionid: 'test-session-id',
			}
		);
		expectPrivacySafePayload( mockedRecordTracksEvent.mock.calls[ 0 ][ 1 ] );
	} );

	it( 'tracks block transformation suggestion exposure with stable metadata', () => {
		trackBlockTransformationSuggestionRendered( {
			suggestionId: 'check-grammar',
			suggestionType: 'text',
			blockType: 'core/paragraph',
		} );

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'jetpack_ai_block_transformation_suggestion_rendered',
			{
				suggestion_id: 'check-grammar',
				suggestion_type: 'text',
				block_type: 'core/paragraph',
				surface: 'jetpack_ai_sidebar',
				sessionid: 'test-session-id',
			}
		);
		expectPrivacySafePayload( mockedRecordTracksEvent.mock.calls[ 0 ][ 1 ] );
	} );
} );
