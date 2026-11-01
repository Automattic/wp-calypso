/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from '../../../testing-library';
import { AppProvider } from '../../context';
import SimplifiedActions from '../simplified-actions';

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
	it( 'collects the comment actions in the Actions menu in the simplified layout', async () => {
		renderWithProvider(
			<AppProvider client={ null } locale="en">
				<SimplifiedActions note={ note } goBack={ noop } />
			</AppProvider>
		);

		expect( screen.queryByRole( 'menuitem', { name: 'Move to trash' } ) ).not.toBeInTheDocument();

		await userEvent.click( screen.getByRole( 'button', { name: 'Actions' } ) );

		expect( await screen.findByRole( 'menuitem', { name: 'Edit' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'menuitem', { name: 'Unapprove' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'menuitem', { name: 'Mark as spam' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'menuitem', { name: 'Move to trash' } ) ).toBeInTheDocument();
	} );

	const pendingNote = ( actions: Record< string, boolean > ) =>
		( {
			...( note as object ),
			body: [ { type: 'comment', text: 'A short reply', actions } ],
		} ) as never;

	it( 'puts Approve beside Like instead of in the menu while the comment is pending', async () => {
		renderWithProvider(
			<AppProvider client={ null } locale="en">
				<SimplifiedActions
					note={ pendingNote( {
						'approve-comment': false,
						'edit-comment': true,
						'trash-comment': true,
					} ) }
					goBack={ noop }
				/>
			</AppProvider>
		);

		expect( screen.getByRole( 'button', { name: 'Approve comment' } ) ).toBeVisible();

		await userEvent.click( screen.getByRole( 'button', { name: 'Actions' } ) );

		expect( await screen.findByRole( 'menuitem', { name: 'Edit' } ) ).toBeVisible();
		expect( screen.queryByRole( 'menuitem', { name: /approve/i } ) ).not.toBeInTheDocument();
	} );

	it( 'drops the Actions menu when Approve is the only moderation action', () => {
		renderWithProvider(
			<AppProvider client={ null } locale="en">
				<SimplifiedActions note={ pendingNote( { 'approve-comment': false } ) } goBack={ noop } />
			</AppProvider>
		);

		expect( screen.getByRole( 'button', { name: 'Approve comment' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Actions' } ) ).not.toBeInTheDocument();
	} );
} );
