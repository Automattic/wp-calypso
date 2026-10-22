import { fireEvent, render, screen } from '@testing-library/react';
import { recordBigSkyTracksEvent } from '../../utils/tracks';
import { withChatResponseTracking } from '../with-chat-response-tracking';
import type { ChatResponseAction } from '../../components/chat-response-tracking';

jest.mock( '../../utils/tracks', () => ( { recordBigSkyTracksEvent: jest.fn() } ) );

function ExampleCard( {
	onResponseAction,
}: {
	onResponseAction?: ( action: ChatResponseAction ) => void;
} ) {
	return (
		<button
			type="button"
			onClick={ () =>
				onResponseAction?.( { action: 'accept', target: 'item', outcome: 'success' } )
			}
		>
			Accept
		</button>
	);
}

const TrackedExampleCard = withChatResponseTracking( 'ExampleCard', ExampleCard );

describe( 'withChatResponseTracking', () => {
	beforeEach( () => jest.clearAllMocks() );

	it( 'records a current surface’s render and its component’s actions', () => {
		render( <TrackedExampleCard surfaceId="surface-1" /> );

		fireEvent.click( screen.getByRole( 'button', { name: 'Accept' } ) );

		const identifiers = {
			component_type: 'ExampleCard',
			tool_id: 'wpcom__render_interactive_ui',
			tool_call_id: 'surface-1',
		};

		expect( jest.mocked( recordBigSkyTracksEvent ).mock.calls ).toEqual( [
			[ 'jetpack_big_sky_chat_response_rendered', identifiers ],
			[
				'jetpack_big_sky_chat_response_action',
				{ ...identifiers, action: 'accept', target: 'item', outcome: 'success' },
			],
		] );
	} );

	it( 'records nothing for a stale surface', () => {
		render( <TrackedExampleCard surfaceId="surface-1" isMessageStale /> );

		fireEvent.click( screen.getByRole( 'button', { name: 'Accept' } ) );

		expect( recordBigSkyTracksEvent ).not.toHaveBeenCalled();
	} );
} );
