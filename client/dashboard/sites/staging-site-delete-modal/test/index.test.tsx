/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../../test-utils';
import StagingSiteDeleteModal from '../index';
import type { Site } from '@automattic/api-core';

const mockMutate = jest.fn();

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {} ),
	combineReducers: jest.fn( ( reducers ) => reducers ),
	createReduxStore: jest.fn(),
	register: jest.fn(),
	createSelector: jest.fn(),
} ) );

jest.mock( '@tanstack/react-router', () => ( {
	...jest.requireActual( '@tanstack/react-router' ),
	useNavigate: () => jest.fn(),
} ) );

jest.mock( '@automattic/api-queries', () => ( {
	siteByIdQuery: jest.fn( () => ( {
		queryKey: [ 'site-by-id' ],
		queryFn: () => Promise.resolve( {} ),
	} ) ),
	stagingSiteDeleteMutation: jest.fn( () => ( {
		mutationFn: () => Promise.resolve( {} ),
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

const createMockSite = ( options = {} ): Site =>
	( {
		ID: 2,
		slug: 'staging-site',
		name: 'Staging Site',
		URL: 'https://staging-site.wordpress.com',
		is_wpcom_staging_site: true,
		capabilities: {
			manage_options: true,
		},
		options: {
			wpcom_production_blog_id: 1,
			...options,
		},
	} ) as Site;

const mockStagingSite = createMockSite();
const mockStagingSiteWithoutProductionId = createMockSite( {
	wpcom_production_blog_id: undefined,
} );

// Helper functions
const getButton = ( name: string ) => screen.getByRole( 'button', { name } );
const renderModal = ( site: Site, onClose = jest.fn() ) =>
	render( <StagingSiteDeleteModal site={ site } onClose={ onClose } /> );

describe( 'StagingSiteDeleteModal', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Modal Display', () => {
		test( 'renders modal with correct title and content', () => {
			renderModal( mockStagingSite );

			expect( screen.getByRole( 'dialog', { name: 'Delete staging site' } ) ).toBeInTheDocument();
			expect(
				screen.getByText(
					'Are you sure you want to delete this staging site? This action cannot be undone and will permanently remove all staging site content.'
				)
			).toBeInTheDocument();
		} );

		test( 'displays cancel and delete buttons', () => {
			renderModal( mockStagingSite );

			expect( getButton( 'Cancel' ) ).toBeInTheDocument();
			expect( getButton( 'Delete staging site' ) ).toBeInTheDocument();
		} );

		test( 'returns null when no production site ID is provided', () => {
			const { container } = renderModal( mockStagingSiteWithoutProductionId );

			expect( container.firstChild ).toBeNull();
		} );
	} );

	describe( 'User Interactions', () => {
		test( 'calls onClose when cancel button is clicked', () => {
			const mockOnClose = jest.fn();
			renderModal( mockStagingSite, mockOnClose );

			fireEvent.click( getButton( 'Cancel' ) );

			expect( mockOnClose ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'triggers mutation when delete button is clicked', () => {
			renderModal( mockStagingSite );

			fireEvent.click( getButton( 'Delete staging site' ) );

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

			renderModal( mockStagingSite );

			expect( getButton( 'Cancel' ) ).toBeDisabled();
			expect( getButton( 'Delete staging site' ) ).toBeDisabled();
		} );
	} );
} );
