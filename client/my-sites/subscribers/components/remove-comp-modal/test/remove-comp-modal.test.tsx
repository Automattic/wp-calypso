/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import RemoveCompModal from '../remove-comp-modal';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockDispatch: jest.Mock = jest.fn( ( action: any ) => {
	if ( typeof action === 'function' ) {
		return action( mockDispatch );
	}
	return action;
} );

jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
} ) );

jest.mock( 'calypso/state/memberships/comps/actions', () => ( {
	requestDeleteComp: jest.fn( () => () => Promise.resolve() ),
} ) );

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

const mockStore = configureStore();

function renderModal( props = {} ) {
	const store = mockStore( {} );
	const queryClient = new QueryClient();
	const defaultProps = {
		siteId: 123,
		compId: 789,
		planName: 'Premium Newsletter',
		username: 'testuser',
		onClose: jest.fn(),
		onRemoved: jest.fn(),
	};

	return {
		...render(
			<Provider store={ store }>
				<QueryClientProvider client={ queryClient }>
					<RemoveCompModal { ...defaultProps } { ...props } />
				</QueryClientProvider>
			</Provider>
		),
		props: { ...defaultProps, ...props },
	};
}

describe( 'RemoveCompModal', () => {
	it( 'renders modal with plan name and username', () => {
		renderModal();

		expect( screen.getByText( /Remove complimentary subscription/ ) ).toBeVisible();
		expect( screen.getByText( /Premium Newsletter/ ) ).toBeVisible();
		expect( screen.getByText( /They will lose access/ ) ).toBeVisible();
		expect( screen.getByText( /testuser/ ) ).toBeVisible();
	} );

	it( 'calls onClose when Cancel is clicked', async () => {
		const user = userEvent.setup();
		const { props } = renderModal();

		await user.click( screen.getByRole( 'button', { name: 'Cancel' } ) );

		expect( props.onClose ).toHaveBeenCalled();
	} );

	it( 'calls requestDeleteComp and onRemoved when Remove is clicked', async () => {
		const { requestDeleteComp } = jest.requireMock( 'calypso/state/memberships/comps/actions' );
		const user = userEvent.setup();
		const { props } = renderModal();

		await user.click( screen.getByRole( 'button', { name: 'Remove' } ) );

		expect( requestDeleteComp ).toHaveBeenCalledWith( 123, 789, expect.any( String ) );
		await screen.findByRole( 'button', { name: 'Remove' } );
		expect( props.onRemoved ).toHaveBeenCalled();
	} );

	it( 'disables Remove button while submitting', async () => {
		const { requestDeleteComp } = jest.requireMock( 'calypso/state/memberships/comps/actions' );
		// Make the request hang indefinitely
		requestDeleteComp.mockImplementation( () => () => new Promise( () => {} ) );

		const user = userEvent.setup();
		renderModal();

		await user.click( screen.getByRole( 'button', { name: 'Remove' } ) );

		expect( screen.getByRole( 'button', { name: 'Remove' } ) ).toBeDisabled();
	} );

	it( 'disables Remove button when compId is missing', () => {
		renderModal( { compId: undefined } );

		expect( screen.getByRole( 'button', { name: 'Remove' } ) ).toBeDisabled();
	} );
} );
