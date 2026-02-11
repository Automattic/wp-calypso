/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../test-utils';
import SiteDisconnectModal from '../index';
import type { Site } from '@automattic/api-core';

const mockMutate = jest.fn();
const mockCreateErrorNotice = jest.fn();
const mockCreateSuccessNotice = jest.fn();

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		createErrorNotice: mockCreateErrorNotice,
		createSuccessNotice: mockCreateSuccessNotice,
	} ),
	combineReducers: jest.fn( ( reducers ) => reducers ),
	createReduxStore: jest.fn(),
	register: jest.fn(),
	createSelector: jest.fn(),
} ) );

jest.mock( '../../../app/router/me', () => ( {
	purchasesRoute: { fullPath: '/me/purchases' },
} ) );

jest.mock( '@automattic/api-queries', () => ( {
	sitePurchasesQuery: jest.fn( () => ( {
		queryKey: [ 'site-purchases' ],
		queryFn: () => Promise.resolve( [] ),
	} ) ),
	siteJetpackDisconnectMutation: jest.fn( () => ( {
		mutationFn: () => Promise.resolve( {} ),
	} ) ),
} ) );

jest.mock( '@tanstack/react-query', () => ( {
	QueryClient: jest.fn().mockImplementation( () => ( {
		getQueryCache: jest.fn( () => ( {
			subscribe: jest.fn( () => jest.fn() ),
		} ) ),
		getMutationCache: jest.fn( () => ( {
			subscribe: jest.fn( () => jest.fn() ),
		} ) ),
	} ) ),
	QueryClientProvider: ( { children }: { children: React.ReactNode } ) => children,
	useQuery: jest.fn( () => ( { data: false, isLoading: false } ) ),
	useMutation: jest.fn( () => ( {
		mutate: mockMutate,
		isPending: false,
		error: null,
	} ) ),
} ) );

const createMockSite = (): Site =>
	( {
		ID: 123,
		slug: 'my-jetpack-site.example.com',
		name: 'My Jetpack Site',
		URL: 'https://my-jetpack-site.example.com',
		jetpack: true,
		jetpack_connection: true,
		is_wpcom_atomic: false,
		is_wpcom_flex: false,
		is_garden: false,
		is_deleted: false,
		capabilities: {
			manage_options: true,
		},
	} ) as Site;

const mockSite = createMockSite();

const getButton = ( name: string ) => screen.getByRole( 'button', { name } );
const renderModal = ( site: Site = mockSite, onClose = jest.fn() ) =>
	render( <SiteDisconnectModal site={ site } onClose={ onClose } /> );

describe( 'SiteDisconnectModal', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		const { useQuery } = require( '@tanstack/react-query' );
		useQuery.mockReturnValue( { data: false, isLoading: false } );
		const { useMutation } = require( '@tanstack/react-query' );
		useMutation.mockReturnValue( {
			mutate: mockMutate,
			isPending: false,
			error: null,
		} );
	} );

	describe( 'Modal display', () => {
		test( 'renders modal with correct title', () => {
			renderModal();

			expect( screen.getByRole( 'dialog', { name: 'Disconnect site' } ) ).toBeInTheDocument();
		} );

		test( 'shows confirmation content when no active purchases', () => {
			renderModal();

			expect( screen.getByText( /Are you sure you want to disconnect/ ) ).toBeInTheDocument();
			expect( screen.getByText( 'my-jetpack-site.example.com' ) ).toBeInTheDocument();
			expect(
				screen.getByText( /Disconnecting will remove the Jetpack connection/ )
			).toBeInTheDocument();
		} );

		test( 'shows purchase warning and disconnect button when active purchases exist', () => {
			const { useQuery } = require( '@tanstack/react-query' );
			useQuery.mockReturnValue( { data: true, isLoading: false } );

			renderModal();

			expect(
				screen.getByText( /You have active subscriptions associated with this site/ )
			).toBeInTheDocument();
			expect( screen.getByRole( 'link', { name: 'Manage purchases' } ) ).toBeInTheDocument();
			expect( getButton( 'Disconnect site' ) ).toBeInTheDocument();
		} );

		test( 'does not show purchase warning when no active purchases', () => {
			renderModal();

			expect( screen.queryByText( /You have active subscriptions/ ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'link', { name: 'Manage purchases' } ) ).not.toBeInTheDocument();
		} );

		test( 'does not render modal content while loading purchases', () => {
			const { useQuery } = require( '@tanstack/react-query' );
			useQuery.mockReturnValue( { data: undefined, isLoading: true } );

			renderModal();

			expect( screen.queryByText( /Are you sure you want to disconnect/ ) ).not.toBeInTheDocument();
			expect( screen.queryByText( /You have active subscriptions/ ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'Confirmation flow', () => {
		test( 'disconnect button is disabled until checkbox is checked', () => {
			renderModal();

			expect( getButton( 'Disconnect site' ) ).toBeDisabled();
		} );

		test( 'disconnect button is enabled after checking the confirmation checkbox', async () => {
			const user = userEvent.setup();
			renderModal();

			const checkbox = screen.getByLabelText( 'I understand the consequences of disconnecting' );
			await user.click( checkbox );

			expect( getButton( 'Disconnect site' ) ).toBeEnabled();
		} );

		test( 'calls onClose when cancel button is clicked', async () => {
			const user = userEvent.setup();
			const mockOnClose = jest.fn();
			renderModal( mockSite, mockOnClose );

			await user.click( getButton( 'Cancel' ) );

			expect( mockOnClose ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'triggers mutation when disconnect button is clicked', async () => {
			const user = userEvent.setup();
			renderModal();

			const checkbox = screen.getByLabelText( 'I understand the consequences of disconnecting' );
			await user.click( checkbox );
			await user.click( getButton( 'Disconnect site' ) );

			expect( mockMutate ).toHaveBeenCalledWith( undefined, {
				onSuccess: expect.any( Function ),
				onError: expect.any( Function ),
			} );
		} );
	} );

	describe( 'Success handling', () => {
		test( 'shows success notice on successful disconnect', async () => {
			const user = userEvent.setup();
			const { useMutation } = require( '@tanstack/react-query' );

			const mockMutateWithSuccess = jest.fn( ( _, options ) => {
				if ( options?.onSuccess ) {
					options.onSuccess();
				}
			} );

			useMutation.mockReturnValue( {
				mutate: mockMutateWithSuccess,
				isPending: false,
				error: null,
			} );

			const mockOnClose = jest.fn();
			renderModal( mockSite, mockOnClose );

			const checkbox = screen.getByLabelText( 'I understand the consequences of disconnecting' );
			await user.click( checkbox );
			await user.click( getButton( 'Disconnect site' ) );

			expect( mockCreateSuccessNotice ).toHaveBeenCalledWith(
				'my-jetpack-site.example.com has been disconnected.',
				{ type: 'snackbar' }
			);
			expect( mockOnClose ).toHaveBeenCalled();
		} );
	} );

	describe( 'Error handling', () => {
		test( 'shows error notice on failed disconnect', async () => {
			const user = userEvent.setup();
			const { useMutation } = require( '@tanstack/react-query' );

			const mockMutateWithError = jest.fn( ( _, options ) => {
				if ( options?.onError ) {
					options.onError( new Error( 'Network error' ) );
				}
			} );

			useMutation.mockReturnValue( {
				mutate: mockMutateWithError,
				isPending: false,
				error: null,
			} );

			renderModal();

			const checkbox = screen.getByLabelText( 'I understand the consequences of disconnecting' );
			await user.click( checkbox );
			await user.click( getButton( 'Disconnect site' ) );

			expect( mockCreateErrorNotice ).toHaveBeenCalledWith( 'Network error', {
				type: 'snackbar',
			} );
		} );

		test( 'shows default error message when no error message is provided', async () => {
			const user = userEvent.setup();
			const { useMutation } = require( '@tanstack/react-query' );

			const mockMutateWithError = jest.fn( ( _, options ) => {
				if ( options?.onError ) {
					options.onError( new Error() );
				}
			} );

			useMutation.mockReturnValue( {
				mutate: mockMutateWithError,
				isPending: false,
				error: null,
			} );

			renderModal();

			const checkbox = screen.getByLabelText( 'I understand the consequences of disconnecting' );
			await user.click( checkbox );
			await user.click( getButton( 'Disconnect site' ) );

			expect( mockCreateErrorNotice ).toHaveBeenCalledWith( 'Failed to disconnect site.', {
				type: 'snackbar',
			} );
		} );
	} );

	describe( 'Loading state', () => {
		test( 'disconnect button shows busy state when mutation is pending', () => {
			const { useMutation } = require( '@tanstack/react-query' );
			useMutation.mockReturnValue( {
				mutate: mockMutate,
				isPending: true,
				error: null,
			} );

			renderModal();

			expect( getButton( 'Disconnect site' ) ).toBeVisible();
		} );
	} );
} );
