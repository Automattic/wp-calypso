/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import SiteOwnerTransferEligibility from '../site-owner-user-search';

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		post: jest.fn(),
	},
} ) );

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( 'calypso/data/users/use-users-query', () => jest.fn() );

jest.mock( 'calypso/my-sites/people/team-members-site-transfer', () => ( {
	__esModule: true,
	default: ( {
		usersQuery,
		onClick,
	}: {
		usersQuery: { data: { users: { ID: number; email: string }[] } };
		onClick: ( email: string ) => void;
	} ) => (
		<ul>
			{ usersQuery.data.users.map( ( user ) => (
				<li key={ user.ID }>
					<button type="button" onClick={ () => onClick( user.email ) }>
						{ user.email }
					</button>
				</li>
			) ) }
		</ul>
	),
} ) );

const post = jest.requireMock( 'calypso/lib/wp' ).req.post as jest.Mock;
const useUsersQuery = jest.requireMock( 'calypso/data/users/use-users-query' ) as jest.Mock;

function deferred< T >() {
	let resolve!: ( value: T ) => void;
	let reject!: ( reason: unknown ) => void;
	const promise = new Promise< T >( ( res, rej ) => {
		resolve = res;
		reject = rej;
	} );
	return { promise, resolve, reject };
}

function renderComponent( onNewUserOwnerSubmit = jest.fn() ) {
	const queryClient = new QueryClient();
	render(
		<QueryClientProvider client={ queryClient }>
			<SiteOwnerTransferEligibility
				siteId={ 1 }
				siteSlug="example.wordpress.com"
				onNewUserOwnerSubmit={ onNewUserOwnerSubmit }
			/>
		</QueryClientProvider>
	);
	return { onNewUserOwnerSubmit };
}

describe( 'SiteOwnerTransferEligibility', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		useUsersQuery.mockReturnValue( {
			data: {
				users: [
					{ ID: 10, email: 'a@example.com' },
					{ ID: 11, email: 'b@example.com' },
				],
			},
		} );
	} );

	it( 'advances with the recipient that was checked', async () => {
		post.mockResolvedValue( { message: 'ok' } );
		const { onNewUserOwnerSubmit } = renderComponent();

		fireEvent.change( screen.getByPlaceholderText( 'example@example.com' ), {
			target: { value: 'a@example.com' },
		} );
		fireEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		await waitFor( () => expect( onNewUserOwnerSubmit ).toHaveBeenCalledWith( 'a@example.com' ) );
		expect( post ).toHaveBeenCalledTimes( 1 );
		expect( post.mock.calls[ 0 ][ 1 ] ).toEqual( { new_site_owner: 'a@example.com' } );
	} );

	it( 'locks the recipient input while the eligibility check is pending', async () => {
		const pending = deferred< { message: string } >();
		post.mockReturnValue( pending.promise );
		const { onNewUserOwnerSubmit } = renderComponent();
		const input = screen.getByPlaceholderText( 'example@example.com' );

		fireEvent.change( input, { target: { value: 'a@example.com' } } );
		fireEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		await waitFor( () => expect( input ).toBeDisabled() );

		await act( async () => {
			pending.resolve( { message: 'ok' } );
			await pending.promise;
		} );

		await waitFor( () => expect( onNewUserOwnerSubmit ).toHaveBeenCalledWith( 'a@example.com' ) );
		expect( onNewUserOwnerSubmit ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'ignores a second suggestion click while a check is pending', async () => {
		const pending = deferred< { message: string } >();
		post.mockReturnValue( pending.promise );
		const { onNewUserOwnerSubmit } = renderComponent();

		fireEvent.change( screen.getByPlaceholderText( 'example@example.com' ), {
			target: { value: 'example' },
		} );
		fireEvent.click( screen.getByRole( 'button', { name: 'a@example.com' } ) );
		await waitFor( () =>
			expect( screen.getByPlaceholderText( 'example@example.com' ) ).toBeDisabled()
		);
		fireEvent.click( screen.getByRole( 'button', { name: 'b@example.com' } ) );

		expect( post ).toHaveBeenCalledTimes( 1 );

		await act( async () => {
			pending.resolve( { message: 'ok' } );
			await pending.promise;
		} );

		await waitFor( () => expect( onNewUserOwnerSubmit ).toHaveBeenCalledWith( 'a@example.com' ) );
		expect( onNewUserOwnerSubmit ).not.toHaveBeenCalledWith( 'b@example.com' );
	} );

	it( 'shows the error for a failed check and keeps the form on the same recipient', async () => {
		post.mockRejectedValue( { code: 'not_eligible', message: 'Not eligible' } );
		const { onNewUserOwnerSubmit } = renderComponent();

		fireEvent.change( screen.getByPlaceholderText( 'example@example.com' ), {
			target: { value: 'a@example.com' },
		} );
		fireEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );

		await waitFor( () => expect( screen.getByText( 'Not eligible' ) ).toBeInTheDocument() );
		expect( onNewUserOwnerSubmit ).not.toHaveBeenCalled();
		expect( screen.getByPlaceholderText( 'example@example.com' ) ).not.toBeDisabled();
	} );
} );
