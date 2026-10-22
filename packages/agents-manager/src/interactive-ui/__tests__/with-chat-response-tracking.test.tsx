import { fireEvent, render, screen } from '@testing-library/react';
import * as tracks from '../../utils/tracks';
import { withChatResponseTracking } from '../with-chat-response-tracking';
import type { ChatResponseAction } from '../../components/chat-response-tracking';

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

describe( 'withChatResponseTracking', () => {
	function TitlePicker( {
		onResponseAction,
	}: {
		onResponseAction?: ( action: ChatResponseAction ) => void;
	} ) {
		return (
			<button
				type="button"
				onClick={ () =>
					onResponseAction?.( { action: 'accept', target: 'title', outcome: 'success' } )
				}
			>
				Accept
			</button>
		);
	}

	const TrackedTitlePicker = withChatResponseTracking( 'JetpackAiTitlePicker', TitlePicker );

	it( 'records a current surface’s render and its component’s actions', () => {
		render( <TrackedTitlePicker surfaceId="surface-1" isMessageStale={ false } /> );

		fireEvent.click( screen.getByRole( 'button', { name: 'Accept' } ) );

		const identifiers = {
			component_type: 'JetpackAiTitlePicker',
			tool_id: 'wpcom__render_interactive_ui',
			tool_call_id: 'surface-1',
		};

		expect( mockRecordBigSkyTracksEvent.mock.calls ).toEqual( [
			[ 'jetpack_big_sky_chat_response_rendered', identifiers ],
			[
				'jetpack_big_sky_chat_response_action',
				{ ...identifiers, action: 'accept', target: 'title', outcome: 'success' },
			],
		] );
	} );

	it( 'records nothing for a stale surface', () => {
		render( <TrackedTitlePicker surfaceId="surface-1" isMessageStale /> );

		fireEvent.click( screen.getByRole( 'button', { name: 'Accept' } ) );

		expect( mockRecordBigSkyTracksEvent ).not.toHaveBeenCalled();
	} );
} );
