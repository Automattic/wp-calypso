/** @jest-environment jsdom */
import { render, screen, waitFor } from '@testing-library/react';
import { completeAgentCheckout } from 'calypso/landing/stepper/utils/agent-site-handoff';
import AgentHandoff from '../agent-handoff';

jest.mock( 'calypso/landing/stepper/utils/agent-site-handoff', () => ( {
	getAgentHandoffId: ( query: URLSearchParams ) => query.get( 'agentHandoffId' ),
	completeAgentCheckout: jest.fn(),
} ) );

describe( 'agent checkout handoff', () => {
	beforeEach( () => {
		window.history.replaceState(
			{},
			'',
			'/checkout/thank-you?agentHandoffId=sbh_0123456789abcdef01234567'
		);
		jest.resetAllMocks();
	} );

	it( 'shows safe close only after the backend acknowledges it', async () => {
		( completeAgentCheckout as jest.Mock ).mockResolvedValue( { safe_close: true } );
		render( <AgentHandoff receiptId={ 42 } /> );
		await waitFor( () =>
			expect( screen.getByRole( 'status' ).textContent ).toContain( 'You can close' )
		);
		expect( completeAgentCheckout ).toHaveBeenCalledWith( 'sbh_0123456789abcdef01234567', 42 );
	} );

	it( 'keeps a pending result open', async () => {
		( completeAgentCheckout as jest.Mock ).mockResolvedValue( {
			safe_close: false,
			next_action: 'Payment is pending.',
		} );
		render( <AgentHandoff receiptId={ 42 } /> );
		await waitFor( () =>
			expect( screen.getByRole( 'status' ).textContent ).toBe( 'Payment is pending.' )
		);
	} );
} );
