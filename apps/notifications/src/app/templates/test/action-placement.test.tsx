/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
	it( 'collects the comment actions in the Actions menu', async () => {
		renderWithProvider(
			<AppProvider client={ null } locale="en">
				<NoteActions note={ note } goBack={ noop } />
			</AppProvider>
		);

		expect( screen.queryByRole( 'menuitem', { name: 'Move to trash' } ) ).not.toBeInTheDocument();

		await userEvent.click( screen.getByRole( 'button', { name: 'Actions' } ) );

		// The fixture's comment is already approved, so the approve toggle reads "Unapprove".
		expect( await screen.findByRole( 'menuitem', { name: 'Edit' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'menuitem', { name: 'Unapprove' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'menuitem', { name: 'Mark as spam' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'menuitem', { name: 'Move to trash' } ) ).toBeInTheDocument();
	} );
} );
