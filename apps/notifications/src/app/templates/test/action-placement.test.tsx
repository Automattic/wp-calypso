/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { renderWithProvider } from '../../../testing-library';
import { AppProvider } from '../../context';
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
				'edit-comment': true,
				'spam-comment': true,
				'trash-comment': true,
			},
		},
	],
	meta: { ids: { site: 10, comment: 20, post: 30 } },
} as never;

describe( 'comment action placement', () => {
	it( 'renders Spam and Trash as inline action buttons alongside the safe actions', () => {
		renderWithProvider(
			<AppProvider client={ null } locale="en">
				<NoteActions note={ note } goBack={ noop } />
			</AppProvider>
		);

		// Buttons expose their tooltip title as the accessible name. The fixture's
		// comment is already approved, so the approve toggle reads "Unapprove comment".
		expect( screen.getByRole( 'button', { name: 'Unapprove comment' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Edit comment' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Mark comment as spam' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Trash comment' } ) ).toBeInTheDocument();
	} );
} );
