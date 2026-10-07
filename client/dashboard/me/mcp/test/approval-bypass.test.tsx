/** @jest-environment jsdom */
import { isAutomatticianQuery, queryClient } from '@automattic/api-queries';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import McpApprovalBypassControl from '../approval-bypass';

const API = 'https://public-api.wordpress.com';

function mockSave( duration: string, reply: object ) {
	return nock( API )
		.post( '/rest/v1.1/me/settings', ( body ) => {
			expect( body ).toEqual( { mcp_approval_bypass: duration } );
			return true;
		} )
		.reply( 200, { mcp_approval_bypass: reply } );
}

async function openSelect() {
	await userEvent.click( screen.getByRole( 'button', { name: /^Bypass permissions/ } ) );
	return screen.getByRole( 'combobox', { name: 'Bypass permissions' } );
}

beforeEach( () => {
	queryClient.clear();
	queryClient.setDefaultOptions( {
		queries: { retry: false, refetchOnMount: false, staleTime: Infinity },
		mutations: { retry: false },
	} );
	queryClient.setQueryData( isAutomatticianQuery().queryKey, true );
} );

describe( '<McpApprovalBypassControl />', () => {
	test( 'asks for confirmation before turning on', async () => {
		const save = mockSave( '2h', { active: true, expires_at: 1_900_000_000 } );

		const { recordTracksEvent } = render(
			<McpApprovalBypassControl approvalBypass={ { active: false, expires_at: null } } />,
			{ queryClient }
		);

		await userEvent.selectOptions( await openSelect(), '2h' );

		const dialog = screen.getByRole( 'dialog', { name: 'Bypass permissions?' } );
		expect( dialog ).toHaveTextContent( 'The bypass ends after 2 hours' );
		expect( save.isDone() ).toBe( false );

		await userEvent.click( screen.getByRole( 'button', { name: 'Bypass permissions' } ) );

		await waitFor( () => expect( save.isDone() ).toBe( true ) );
		await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument() );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_mcp_approval_bypass_changed',
			expect.objectContaining( { duration: '2h' } )
		);
	} );

	test( 'does not save when the confirmation is cancelled', async () => {
		const save = mockSave( 'forever', { active: true, expires_at: null } );

		render( <McpApprovalBypassControl approvalBypass={ { active: false, expires_at: null } } />, {
			queryClient,
		} );

		const select = await openSelect();
		await userEvent.selectOptions( select, 'forever' );
		expect( screen.getByRole( 'dialog' ) ).toHaveTextContent(
			'The bypass stays on until you turn it off'
		);

		const [ , cancelButton ] = screen.getAllByRole( 'button', { name: 'Cancel' } );
		await userEvent.click( cancelButton );

		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		expect( select ).toHaveValue( 'off' );
		expect( save.isDone() ).toBe( false );
	} );

	test( 'shows when it ends and turns off without confirmation', async () => {
		const save = mockSave( 'off', { active: false, expires_at: null } );

		render(
			<McpApprovalBypassControl
				approvalBypass={ { active: true, expires_at: Math.floor( Date.now() / 1000 ) + 3600 } }
			/>,
			{ queryClient }
		);

		const select = await openSelect();
		expect( select ).toHaveValue( 'current' );
		expect( screen.getByRole( 'option', { selected: true } ) ).toHaveTextContent( /^On until / );

		await userEvent.selectOptions( select, 'off' );

		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		await waitFor( () => expect( save.isDone() ).toBe( true ) );
	} );

	test( 'changes the duration while on without confirmation', async () => {
		const save = mockSave( '30m', { active: true, expires_at: 1_900_000_000 } );

		render( <McpApprovalBypassControl approvalBypass={ { active: true, expires_at: null } } />, {
			queryClient,
		} );

		expect( screen.getByText( 'On until turned off' ) ).toBeVisible();
		const select = await openSelect();
		expect( select ).toHaveValue( 'forever' );

		await userEvent.selectOptions( select, '30m' );

		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
		await waitFor( () => expect( save.isDone() ).toBe( true ) );
	} );
} );
