/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider as render } from 'calypso/test-helpers/testing-library';
import { WriteButton } from '../write-button';

const mockRecordReaderTracksEvent = jest.fn();
jest.mock( 'calypso/state/reader/analytics/useRecordReaderTracksEvent', () => ( {
	useRecordReaderTracksEvent: () => mockRecordReaderTracksEvent,
} ) );

const stateWithSites = { currentUser: { user: { site_count: 2 } } };
const stateWithoutSites = { currentUser: { user: { site_count: 0 } } };

describe( 'WriteButton', () => {
	beforeEach( () => {
		mockRecordReaderTracksEvent.mockClear();
	} );

	it( 'renders a full-page link to the wpcom write editor when the user has sites', () => {
		render( <WriteButton />, { initialState: stateWithSites } );
		const link = screen.getByRole( 'link', { name: 'Write' } );
		// source=reader lets the write editor's back button return to the Reader.
		expect( link ).toHaveAttribute( 'href', 'https://wordpress.com/write-editor?source=reader' );
		// rel="external" keeps page.js from hijacking it as an SPA route.
		expect( link ).toHaveAttribute( 'rel', 'external' );
	} );

	it( 'renders nothing when the user has no sites', () => {
		render( <WriteButton />, { initialState: stateWithoutSites } );
		expect( screen.queryByRole( 'link', { name: 'Write' } ) ).not.toBeInTheDocument();
	} );

	it( 'records a Tracks event when clicked', async () => {
		const user = userEvent.setup();
		render( <WriteButton />, { initialState: stateWithSites } );
		await user.click( screen.getByRole( 'link', { name: 'Write' } ) );
		expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_write_button_clicked'
		);
	} );
} );
