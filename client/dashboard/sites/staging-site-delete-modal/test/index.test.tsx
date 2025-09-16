/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../../test-utils';
import StagingSiteDeleteModal from '../index';
import type { Site } from '@automattic/api-core';

const mockCreateErrorNotice = jest.fn();
const mockCreateSuccessNotice = jest.fn();
const mockCreateNotice = jest.fn();
const mockNavigate = jest.fn();
const mockMutate = jest.fn();

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		createSuccessNotice: mockCreateSuccessNotice,
		createNotice: mockCreateNotice,
		createErrorNotice: mockCreateErrorNotice,
	} ),
	combineReducers: jest.fn( ( reducers ) => reducers ),
	createReduxStore: jest.fn(),
	register: jest.fn(),
	createSelector: jest.fn(),
} ) );

jest.mock( '@tanstack/react-router', () => ( {
	...jest.requireActual( '@tanstack/react-router' ),
	useNavigate: () => mockNavigate,
} ) );

jest.mock( '@automattic/api-queries', () => ( {
	siteByIdQuery: jest.fn( ( siteId ) => ( {
		queryKey: [ 'site-by-id', siteId ],
		queryFn: () => Promise.resolve( { ID: siteId, slug: `production-site-${ siteId }` } ),
	} ) ),
	stagingSiteDeleteMutation: jest.fn( () => ( {
		mutationFn: () => Promise.resolve( { success: true } ),
	} ) ),
} ) );

jest.mock( '@tanstack/react-query', () => ( {
	QueryClient: jest.fn().mockImplementation( () => ( {} ) ),
	QueryClientProvider: ( { children }: { children: React.ReactNode } ) => children,
	useQuery: jest.fn( () => ( { data: { ID: 1, slug: 'production-site' }, isLoading: false } ) ),
	useMutation: jest.fn( () => ( {
		mutate: mockMutate,
		isPending: false,
		error: null,
	} ) ),
} ) );

// Test data
const mockStagingSite: Site = {
	ID: 2,
	slug: 'staging-site',
	name: 'Staging Site',
	URL: 'https://staging-site.wordpress.com',
	is_wpcom_staging_site: true,
	options: {
		wpcom_production_blog_id: 1,
	},
	capabilities: {
		manage_options: true,
	},
} as Site;

const mockStagingSiteWithoutProductionId: Site = {
	ID: 2,
	slug: 'staging-site',
	name: 'Staging Site',
	URL: 'https://staging-site.wordpress.com',
	is_wpcom_staging_site: true,
	options: {},
	capabilities: {
		manage_options: true,
	},
} as Site;

describe( 'StagingSiteDeleteModal', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockMutate.mockImplementation( jest.fn() );
	} );

	describe( 'Modal Display', () => {
		test( 'renders modal with correct title and content', () => {
			render( <StagingSiteDeleteModal site={ mockStagingSite } onClose={ jest.fn() } /> );

			expect( screen.getByRole( 'dialog', { name: 'Delete staging site' } ) ).toBeInTheDocument();
			expect(
				screen.getByText(
					'Are you sure you want to delete this staging site? This action cannot be undone and will permanently remove all staging site content.'
				)
			).toBeInTheDocument();
		} );

		test( 'displays cancel and delete buttons', () => {
			render( <StagingSiteDeleteModal site={ mockStagingSite } onClose={ jest.fn() } /> );

			expect( screen.getByRole( 'button', { name: 'Cancel' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: 'Delete staging site' } ) ).toBeInTheDocument();
		} );

		test( 'returns null when no production site ID is provided', () => {
			const { container } = render(
				<StagingSiteDeleteModal site={ mockStagingSiteWithoutProductionId } onClose={ jest.fn() } />
			);

			expect( container.firstChild ).toBeNull();
		} );
	} );

	describe( 'User Interactions', () => {
		test( 'calls onClose when cancel button is clicked', () => {
			const mockOnClose = jest.fn();

			render( <StagingSiteDeleteModal site={ mockStagingSite } onClose={ mockOnClose } /> );

			fireEvent.click( screen.getByRole( 'button', { name: 'Cancel' } ) );

			expect( mockOnClose ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'triggers mutation when delete button is clicked', () => {
			render( <StagingSiteDeleteModal site={ mockStagingSite } onClose={ jest.fn() } /> );

			fireEvent.click( screen.getByRole( 'button', { name: 'Delete staging site' } ) );

			expect( mockMutate ).toHaveBeenCalledWith( undefined, {
				onError: expect.any( Function ),
				onSuccess: expect.any( Function ),
			} );
		} );
	} );

	describe( 'Loading State', () => {
		test( 'disables buttons when mutation is pending', () => {
			const { useMutation } = require( '@tanstack/react-query' );
			useMutation.mockReturnValue( {
				mutate: mockMutate,
				isPending: true,
				error: null,
			} );

			render( <StagingSiteDeleteModal site={ mockStagingSite } onClose={ jest.fn() } /> );

			expect( screen.getByRole( 'button', { name: 'Cancel' } ) ).toBeDisabled();
			expect( screen.getByRole( 'button', { name: 'Delete staging site' } ) ).toBeDisabled();
		} );

		test( 'shows busy state on delete button when mutation is pending', () => {
			const { useMutation } = require( '@tanstack/react-query' );
			useMutation.mockReturnValue( {
				mutate: mockMutate,
				isPending: true,
				error: null,
			} );

			render( <StagingSiteDeleteModal site={ mockStagingSite } onClose={ jest.fn() } /> );

			const deleteButton = screen.getByRole( 'button', { name: 'Delete staging site' } );
			expect( deleteButton ).toBeDisabled();
		} );
	} );
} );
