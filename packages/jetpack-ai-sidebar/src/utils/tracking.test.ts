/**
 * @jest-environment jsdom
 */

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

import { recordTracksEvent } from '@automattic/calypso-analytics';
import {
	trackReviewMediationError,
	trackReviewMediationItemAction,
	trackReviewMediationResultRendered,
	trackReviewMediationSuggestionClick,
	trackReviewMediationSuggestionRendered,
} from './tracking';

const mockedRecordTracksEvent = recordTracksEvent as jest.MockedFunction<
	typeof recordTracksEvent
>;

const expectPrivacySafePayload = ( properties: Record< string, unknown > ) => {
	expect( properties ).not.toHaveProperty( 'post_id' );
	expect( properties ).not.toHaveProperty( 'post_type' );
	expect( properties ).not.toHaveProperty( 'block_index' );
	expect( properties ).not.toHaveProperty( 'run_id' );
	expect( properties ).not.toHaveProperty( 'trigger' );
	expect( properties ).not.toHaveProperty( 'cache_hit' );
	expect( properties ).not.toHaveProperty( 'auto_suggested_edit_count' );
	expect( properties ).not.toHaveProperty( 'manual_suggested_edit_count' );
	expect( properties ).not.toHaveProperty( 'success_count' );
	expect( properties ).not.toHaveProperty( 'failure_count' );
	expect( properties ).not.toHaveProperty( 'text' );
	expect( properties ).not.toHaveProperty( 'reviewer' );
};

type WindowWithAgentsManagerActions = Window & {
	__agentsManagerActions?: {
		getSessionId?: () => string;
	};
};

describe( 'Review Mediation tracking', () => {
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
		trackReviewMediationSuggestionRendered();

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'jetpack_ai_review_mediation_suggestion_rendered',
			{
				sessionid: 'test-session-id',
			}
		);
		expectPrivacySafePayload( mockedRecordTracksEvent.mock.calls[ 0 ][ 1 ] );
	} );

	it( 'tracks suggestion click with a client-only join id', () => {
		trackReviewMediationSuggestionClick( {
			clientRunId: 'client-run-1',
		} );

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'jetpack_ai_review_mediation_suggestion_click',
			{
				client_run_id: 'client-run-1',
				sessionid: 'test-session-id',
			}
		);
		expectPrivacySafePayload( mockedRecordTracksEvent.mock.calls[ 0 ][ 1 ] );
	} );

	it( 'tracks rendered results as aggregate usefulness counts', () => {
		trackReviewMediationResultRendered( {
			outcome: 'success',
			conflictCount: 2,
			implicationCount: 3,
			suggestedEditCount: 8,
			guidelineViolationCount: 0,
			clientRunId: 'client-run-1',
		} );

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'jetpack_ai_review_mediation_result_rendered',
			{
				outcome: 'success',
				conflict_count: 2,
				implication_count: 3,
				suggested_edit_count: 8,
				guideline_violation_count: 0,
				client_run_id: 'client-run-1',
				sessionid: 'test-session-id',
			}
		);
		expectPrivacySafePayload( mockedRecordTracksEvent.mock.calls[ 0 ][ 1 ] );
	} );

	it( 'tracks item actions after completion without row identifiers', () => {
		trackReviewMediationItemAction( {
			action: 'bulk_accept',
			target: 'mixed',
			outcome: 'partial_failed',
			clientRunId: 'client-run-1',
			itemCount: 4,
		} );

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'jetpack_ai_review_mediation_item_action',
			{
				action: 'bulk_accept',
				target: 'mixed',
				outcome: 'partial_failed',
				client_run_id: 'client-run-1',
				item_count: 4,
				sessionid: 'test-session-id',
			}
		);
		expectPrivacySafePayload( mockedRecordTracksEvent.mock.calls[ 0 ][ 1 ] );
	} );

	it( 'tracks errors with only the phase, type, and optional join id', () => {
		trackReviewMediationError( {
			errorPhase: 'apply',
			errorType: 'apply_failed',
			clientRunId: 'client-run-1',
		} );

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith( 'jetpack_ai_review_mediation_error', {
			error_phase: 'apply',
			error_type: 'apply_failed',
			client_run_id: 'client-run-1',
			sessionid: 'test-session-id',
		} );
		expectPrivacySafePayload( mockedRecordTracksEvent.mock.calls[ 0 ][ 1 ] );
	} );
} );
