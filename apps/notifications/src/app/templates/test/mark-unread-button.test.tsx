/**
 * @vitest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { init as initWpcom } from '../../../panel/rest-client/wpcom';
import { renderWithProvider } from '../../../testing-library';
import { AppProvider } from '../../context';
import MarkUnreadButton from '../mark-unread-button';
import type { Note } from '../../types';

const note = { id: 5, type: 'comment', read: 1 } as Note;

describe( 'MarkUnreadButton', () => {
	let post: ReturnType< typeof vi.fn >;

	beforeEach( () => {
		localStorage.clear();
		post = vi.fn();
		initWpcom( { req: { post } } );
	} );

	it( 'renders nothing while the feature is off', () => {
		renderWithProvider(
			<AppProvider client={ null } locale="en">
				<MarkUnreadButton note={ note } goBack={ vi.fn() } />
			</AppProvider>
		);

		expect( screen.queryByRole( 'button', { name: 'Mark as unread' } ) ).not.toBeInTheDocument();
	} );

	it( 'marks the note as unread and closes it', async () => {
		const goBack = vi.fn();
		renderWithProvider(
			<AppProvider client={ null } locale="en" isMarkAsUnreadEnabled>
				<MarkUnreadButton note={ note } goBack={ goBack } />
			</AppProvider>
		);

		await userEvent.click( screen.getByRole( 'button', { name: 'Mark as unread' } ) );

		expect( post ).toHaveBeenCalledWith(
			{ path: '/notifications/read' },
			null,
			{ counts: { 5: -1 } },
			expect.any( Function )
		);
		expect( goBack ).toHaveBeenCalledTimes( 1 );
	} );
} );
