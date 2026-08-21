/**
 * @jest-environment jsdom
 */

import {
	getResponseRenderedTrackingProperties,
	trackSplitScreenGuideClick,
	trackSplitScreenGuideRendered,
} from './tracking';

// Guards the props this package hands to the family recorder; the recorder
// itself attaches family context (including post_type) on the wire. The shared
// response events carry their own allowlisted metadata (counts, review_context,
// cache_hit).
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
		recordBigSkyTracksEvent?: ( eventName: string, props?: Record< string, unknown > ) => void;
	};
};

describe( 'Jetpack AI sidebar tracking', () => {
	const mockRecordBigSkyTracksEvent = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
		( window as WindowWithAgentsManagerActions ).__agentsManagerActions = {
			recordBigSkyTracksEvent: mockRecordBigSkyTracksEvent,
		};
	} );

	afterEach( () => {
		delete ( window as WindowWithAgentsManagerActions ).__agentsManagerActions;
	} );

	it( 'records split-screen guide clicks through the family recorder', () => {
		expect( trackSplitScreenGuideClick( { componentType: 'post-feedback' } ) ).toBe( true );

		expect( mockRecordBigSkyTracksEvent ).toHaveBeenCalledWith( 'split_screen_guide_click', {
			component_type: 'post-feedback',
			guide_variant: 'inline_action_card',
		} );
		expectPrivacySafePayload( mockRecordBigSkyTracksEvent.mock.calls[ 0 ][ 1 ] );
	} );

	it( 'records a split-screen guide impression through the family recorder', () => {
		trackSplitScreenGuideRendered( { componentType: 'ai-editorial-review' } );

		expect( mockRecordBigSkyTracksEvent ).toHaveBeenCalledWith( 'split_screen_guide_rendered', {
			component_type: 'ai-editorial-review',
			guide_variant: 'inline_action_card',
		} );
		expectPrivacySafePayload( mockRecordBigSkyTracksEvent.mock.calls[ 0 ][ 1 ] );
	} );

	it.each( [
		[ 'impression', trackSplitScreenGuideRendered, 'split_screen_guide_rendered' ],
		[ 'click', trackSplitScreenGuideClick, 'split_screen_guide_click' ],
	] )( 'attaches the tool call to a guide %s when known', ( _name, track, eventName ) => {
		track( { componentType: 'proofread', toolCallId: 'tool-call-1' } );

		expect( mockRecordBigSkyTracksEvent ).toHaveBeenCalledWith( eventName, {
			component_type: 'proofread',
			guide_variant: 'inline_action_card',
			tool_call_id: 'tool-call-1',
		} );
	} );

	it( 'omits the tool call property when none is known', () => {
		trackSplitScreenGuideClick( { componentType: 'proofread' } );

		expect( mockRecordBigSkyTracksEvent.mock.calls[ 0 ][ 1 ] ).not.toHaveProperty( 'tool_call_id' );
	} );

	it( 'reports failure before Agents Manager publishes its recorder', () => {
		( window as WindowWithAgentsManagerActions ).__agentsManagerActions = {};

		expect( trackSplitScreenGuideRendered( { componentType: 'proofread' } ) ).toBe( false );
		expect( trackSplitScreenGuideClick( { componentType: 'proofread' } ) ).toBe( false );
	} );

	it( 'reports failure when the actions bridge is absent', () => {
		delete ( window as WindowWithAgentsManagerActions ).__agentsManagerActions;

		expect( trackSplitScreenGuideRendered( { componentType: 'proofread' } ) ).toBe( false );
		expect( trackSplitScreenGuideClick( { componentType: 'proofread' } ) ).toBe( false );
	} );

	it.each( [ 'proofread', 'post-feedback' ] )(
		'counts suggested edits in %s responses',
		( componentType ) => {
			expect(
				getResponseRenderedTrackingProperties( componentType, {
					items: [ { title: 'First' }, null, { title: 'Second' } ],
				} )
			).toEqual( { suggested_edit_count: 2 } );
		}
	);

	it( 'counts each AI Editorial Review finding type', () => {
		expect(
			getResponseRenderedTrackingProperties( 'ai-editorial-review', {
				suggested_edits: [ {}, {} ],
				conflicts: [ {} ],
				implications: [ {}, null ],
				guideline_violations: [
					{ guideline_quote: 'Use sentence case.' },
					{ guideline_quote: '' },
					{ guideline_quote: 'Prefer active voice.' },
				],
				review_context: 'notes_and_guidelines',
			} )
		).toEqual( {
			suggested_edit_count: 2,
			conflict_count: 1,
			implication_count: 1,
			guideline_violation_count: 2,
			review_context: 'notes_and_guidelines',
		} );
	} );

	it( 'omits an unknown AI Editorial Review context', () => {
		expect(
			getResponseRenderedTrackingProperties( 'ai-editorial-review', {
				review_context: 'unknown-context',
			} )
		).not.toHaveProperty( 'review_context' );
	} );

	it( 'relays the server-declared AI Editorial Review cache signal', () => {
		expect(
			getResponseRenderedTrackingProperties( 'ai-editorial-review', { cache_hit: true } )
		).toMatchObject( { cache_hit: true } );
		expect(
			getResponseRenderedTrackingProperties( 'ai-editorial-review', { cache_hit: false } )
		).toMatchObject( { cache_hit: false } );
	} );

	it( 'omits a non-boolean or absent cache signal', () => {
		expect(
			getResponseRenderedTrackingProperties( 'ai-editorial-review', { cache_hit: 'yes' } )
		).not.toHaveProperty( 'cache_hit' );
		expect( getResponseRenderedTrackingProperties( 'ai-editorial-review', {} ) ).not.toHaveProperty(
			'cache_hit'
		);
	} );

	it( 'omits response metadata for components without review findings', () => {
		expect(
			getResponseRenderedTrackingProperties( 'title-picker', { titles: [ { title: 'Title' } ] } )
		).toBeUndefined();
	} );
} );
