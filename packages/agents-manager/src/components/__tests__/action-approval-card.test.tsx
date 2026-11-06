/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActionApprovalCard } from '../action-approval-card';
import type { ActionApproval } from '../../utils/action-approvals';

const PENDING: ActionApproval = {
	toolCallId: 'toolu_abc',
	toolId: 'wpcom__plugins',
	proposalId: 123,
	arguments: { action: 'uninstall', plugin: 'hello-dolly' },
	origin: 'execute',
	status: 'pending',
	timestamp: 0,
};

function renderCard( approval: Partial< ActionApproval > = {}, isDisabled = false ) {
	const onDecide = jest.fn();
	render(
		<ActionApprovalCard
			approval={ { ...PENDING, ...approval } }
			isDisabled={ isDisabled }
			onDecide={ onDecide }
		/>
	);
	return { onDecide };
}

describe( 'ActionApprovalCard', () => {
	it( 'shows what will run, with its arguments', () => {
		renderCard();

		expect( screen.getByText( 'Plugin uninstall (hello-dolly)' ) ).toBeVisible();
		expect( screen.getByText( 'plugin' ) ).toBeVisible();
		expect( screen.getByText( 'hello-dolly' ) ).toBeVisible();
	} );

	it.each( [ 'execute', 'dispatch' ] as const )(
		'names a held %s call by the server’s label, with its arguments',
		( origin ) => {
			renderCard( {
				origin,
				toolId: 'wpcom__plugin_uninstall',
				label: 'Uninstall plugin',
				arguments: { slug: 'hello-dolly' },
			} );

			expect( screen.getByText( 'Uninstall plugin' ) ).toBeVisible();
			expect( screen.getByText( 'slug' ) ).toBeVisible();
			expect( screen.getByText( 'hello-dolly' ) ).toBeVisible();
		}
	);

	it.each( [
		[ 'Allow', 'allow' ],
		[ 'Decline', 'decline' ],
	] )( 'sends %s', async ( label, decision ) => {
		const { onDecide } = renderCard();

		await userEvent.click( screen.getByRole( 'button', { name: label } ) );

		expect( onDecide ).toHaveBeenCalledWith( decision );
	} );

	it( 'disables both buttons while the answer is sending', async () => {
		const { onDecide } = renderCard( { status: 'sending' } );

		await userEvent.click( screen.getByRole( 'button', { name: 'Allow' } ) );

		expect( onDecide ).not.toHaveBeenCalled();
		expect( screen.getByRole( 'button', { name: 'Decline' } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
		expect( screen.getByRole( 'status' ) ).toHaveTextContent( 'Sending…' );
	} );

	it( 'shows the error and keeps the buttons for a retry', () => {
		renderCard( { status: 'error', message: 'Please try again.' } );

		expect( screen.getByRole( 'status' ) ).toHaveTextContent( 'Please try again.' );
		expect( screen.getByRole( 'button', { name: 'Allow' } ) ).toBeEnabled();
	} );

	it( 'is replaced by a status message once answered', () => {
		renderCard( { status: 'done' } );

		expect( screen.getByRole( 'status' ) ).toHaveTextContent(
			'Approved: Plugin uninstall (hello-dolly). Done.'
		);
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Approval needed' ) ).not.toBeInTheDocument();
	} );
} );
