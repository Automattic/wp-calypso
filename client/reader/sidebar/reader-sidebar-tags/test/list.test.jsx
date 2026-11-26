/**
 * @vitest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ReaderSidebarTagsList from '../list';

vi.mock( 'calypso/reader/stats', async () => ( {
	...( await vi.importActual( 'calypso/reader/stats' ) ),
	recordAction: vi.fn(),
	recordGaEvent: vi.fn(),
} ) );

vi.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEvent: vi.fn( () => ( { type: 'ANALYTICS_EVENT_RECORD' } ) ),
} ) );

// jsdom cannot navigate, so keep link clicks from logging "Not implemented" errors.
const preventNavigation = ( event ) => event.preventDefault();

describe( 'ReaderSidebarTagsList', () => {
	beforeAll( () => {
		document.addEventListener( 'click', preventNavigation );
	} );

	afterAll( () => {
		document.removeEventListener( 'click', preventNavigation );
	} );

	afterEach( () => {
		vi.clearAllMocks();
	} );

	it( 'records a tracks event when the "See all tags" link is clicked', async () => {
		const user = userEvent.setup();
		renderWithProvider( <ReaderSidebarTagsList tags={ [] } path="/reader" /> );

		await user.click( screen.getByRole( 'link', { name: 'See all tags' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_sidebar_tags_page_link_clicked',
			expect.any( Object )
		);
	} );
} );
