/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import preferencesReducer from 'calypso/state/preferences/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ConversationsIntro from '../intro';

jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEvent: jest.fn( () => ( { type: 'ANALYTICS_EVENT_RECORD' } ) ),
} ) );

function renderIntro( { remoteValues = {}, ...props } = {} ) {
	return renderWithProvider( <ConversationsIntro { ...props } />, {
		reducers: { preferences: preferencesReducer },
		initialState: { preferences: { remoteValues } },
	} );
}

describe( 'ConversationsIntro', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	test( 'records a render event when the intro is shown', () => {
		renderIntro();

		expect( screen.getByText( 'Welcome to Conversations.' ) ).toBeVisible();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_conversations_intro_render',
			expect.any( Object )
		);
	} );

	test( 'records a dismiss event when the intro is closed', async () => {
		const user = userEvent.setup();
		renderIntro();

		await user.click( screen.getByRole( 'button', { name: /close/i } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_conversations_intro_dismiss',
			expect.any( Object )
		);
	} );

	test( 'does not render or record anything when the intro was already dismissed', () => {
		renderIntro( { remoteValues: { has_used_reader_conversations: true } } );

		expect( screen.queryByText( 'Welcome to Conversations.' ) ).not.toBeInTheDocument();
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );
} );
