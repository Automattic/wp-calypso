/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from '../../../testing-library';
import { AppProvider } from '../../context';
import ActionDropdown from '../action-dropdown';
import NoteActions from '../actions';

const noop = () => {};

const note = {
	id: 1,
	type: 'comment',
	subject: [ { text: 'Jane Doe', ranges: [] } ],
	body: [
		{
			type: 'comment',
			text: 'A short reply',
			actions: {
				'approve-comment': true,
				'spam-comment': true,
				'edit-comment': true,
			},
		},
	],
	meta: { ids: { site: 10, comment: 20, post: 30 } },
} as never;

describe( 'comment action placement', () => {
	it( 'keeps safe actions inline but does not render Spam in the inline action row', () => {
		renderWithProvider(
			<AppProvider client={ null } locale="en">
				<NoteActions note={ note } />
			</AppProvider>
		);

		// Buttons expose their tooltip title as the accessible name. The fixture's
		// comment is already approved, so the approve toggle reads "Unapprove comment".
		expect( screen.getByRole( 'button', { name: 'Unapprove comment' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Edit comment' } ) ).toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: 'Mark comment as spam' } )
		).not.toBeInTheDocument();
	} );

	it( 'offers Spam in the overflow menu when the note can be marked as spam', async () => {
		renderWithProvider( <ActionDropdown note={ note } goBack={ noop } /> );

		await userEvent.click( screen.getByRole( 'button', { name: 'Actions' } ) );

		expect( await screen.findByRole( 'menuitem', { name: 'Spam' } ) ).toBeInTheDocument();
	} );
} );
