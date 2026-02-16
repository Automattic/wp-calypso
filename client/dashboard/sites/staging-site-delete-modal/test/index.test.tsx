/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import StagingSiteDeleteModal from '../index';
import type { Site } from '@automattic/api-core';

const mockCreateErrorNotice = jest.fn();
const mockCreateSuccessNotice = jest.fn();
const mockNavigate = jest.fn();

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

jest.mock( '@tanstack/react-router', () => ( {
	...jest.requireActual( '@tanstack/react-router' ),
	useNavigate: () => mockNavigate,
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

function mockProductionSite() {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/sites/1' )
		.query( true )
		.reply( 200, {
			ID: 1,
			slug: 'production-site',
			name: 'Production Site',
		} );
}

function mockStagingSiteDelete( status = 200, body: object = {} ) {
	return nock( 'https://public-api.wordpress.com:443' )
		.delete( '/wpcom/v2/sites/1/staging-site/2' )
		.reply( status, body );
}

const getButton = ( name: string ) => screen.getByRole( 'button', { name } );

describe( 'StagingSiteDeleteModal', () => {
	describe( 'Modal Display', () => {
		test( 'renders modal with correct title and content', () => {
			mockProductionSite();
			render( <StagingSiteDeleteModal site={ mockStagingSite } onClose={ jest.fn() } /> );

			expect( screen.getByRole( 'dialog', { name: 'Delete staging site' } ) ).toBeInTheDocument();
			expect(
				screen.getByText(
					'Are you sure you want to delete this staging site? This action cannot be undone and will permanently remove all staging site content.'
				)
			).toBeInTheDocument();
		} );

		test( 'displays cancel and delete buttons', () => {
			mockProductionSite();
			render( <StagingSiteDeleteModal site={ mockStagingSite } onClose={ jest.fn() } /> );

			expect( getButton( 'Cancel' ) ).toBeInTheDocument();
			expect( getButton( 'Delete staging site' ) ).toBeInTheDocument();
		} );

		test( 'returns null when no production site ID is provided', () => {
			mockProductionSite();
			const { container } = render(
				<StagingSiteDeleteModal site={ mockStagingSiteWithoutProductionId } onClose={ jest.fn() } />
			);

			expect( container.firstChild ).toBeNull();
		} );
	} );

	describe( 'User Interactions', () => {
		test( 'calls onClose when cancel button is clicked', async () => {
			const user = userEvent.setup();
			const mockOnClose = jest.fn();
			mockProductionSite();
			render( <StagingSiteDeleteModal site={ mockStagingSite } onClose={ mockOnClose } /> );
			await waitFor( () => expect( getButton( 'Delete staging site' ) ).toBeEnabled() );

			await user.click( getButton( 'Cancel' ) );

			expect( mockOnClose ).toHaveBeenCalledTimes( 1 );
		} );

		test( 'triggers mutation when delete button is clicked', async () => {
			const user = userEvent.setup();
			const scope = mockStagingSiteDelete();
			mockProductionSite();
			render( <StagingSiteDeleteModal site={ mockStagingSite } onClose={ jest.fn() } /> );
			await waitFor( () => expect( getButton( 'Delete staging site' ) ).toBeEnabled() );

			await user.click( getButton( 'Delete staging site' ) );

			expect( scope.isDone() ).toBe( true );
		} );
	} );

	describe( 'Loading State', () => {
		test( 'disables buttons when mutation is pending', async () => {
			const user = userEvent.setup();
			mockStagingSiteDelete();
			mockProductionSite();
			render( <StagingSiteDeleteModal site={ mockStagingSite } onClose={ jest.fn() } /> );
			await waitFor( () => expect( getButton( 'Delete staging site' ) ).toBeEnabled() );

			await user.click( getButton( 'Delete staging site' ) );

			expect( getButton( 'Cancel' ) ).toBeDisabled();
			expect( getButton( 'Delete staging site' ) ).toBeDisabled();
		} );
	} );

	describe( 'Error Handling', () => {
		test( 'shows error notice and tracks failure when deletion fails', async () => {
			const user = userEvent.setup();
			mockStagingSiteDelete( 500, { message: 'Network error' } );

			mockProductionSite();
			const { recordTracksEvent } = render(
				<StagingSiteDeleteModal site={ mockStagingSite } onClose={ jest.fn() } />
			);
			await waitFor( () => expect( getButton( 'Delete staging site' ) ).toBeEnabled() );

			await user.click( getButton( 'Delete staging site' ) );

			await waitFor( () => {
				expect( mockCreateErrorNotice ).toHaveBeenCalledWith( 'Network error', {
					type: 'snackbar',
				} );
			} );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_hosting_configuration_staging_site_delete_failure'
			);
		} );

		test( 'shows default error message when no error message is provided', async () => {
			const user = userEvent.setup();
			mockStagingSiteDelete( 400, { message: '' } );

			mockProductionSite();
			render( <StagingSiteDeleteModal site={ mockStagingSite } onClose={ jest.fn() } /> );
			await waitFor( () => expect( getButton( 'Delete staging site' ) ).toBeEnabled() );

			await user.click( getButton( 'Delete staging site' ) );

			await waitFor( () => {
				expect( mockCreateErrorNotice ).toHaveBeenCalledWith( 'Failed to delete staging site', {
					type: 'snackbar',
				} );
			} );
		} );
	} );

	describe( 'Success Handling', () => {
		beforeEach( () => {
			// Mock window.location for navigation tests
			Object.defineProperty( window, 'location', {
				writable: true,
				value: {
					hostname: 'my.localhost',
					pathname: '/sites/test-site',
				},
			} );
		} );

		test( 'shows success notice, closes modal, and navigates on successful deletion', async () => {
			const user = userEvent.setup();
			mockStagingSiteDelete();
			const mockOnClose = jest.fn();
			mockProductionSite();
			const { recordTracksEvent } = render(
				<StagingSiteDeleteModal site={ mockStagingSite } onClose={ mockOnClose } />
			);
			await waitFor( () => expect( getButton( 'Delete staging site' ) ).toBeEnabled() );

			await user.click( getButton( 'Delete staging site' ) );

			await waitFor( () => {
				expect( mockCreateSuccessNotice ).toHaveBeenCalledWith(
					'We are deleting your staging site. We will notify you when it is done.',
					{ type: 'snackbar' }
				);
			} );

			expect( mockOnClose ).toHaveBeenCalledTimes( 1 );

			await waitFor( () => {
				expect( mockNavigate ).toHaveBeenCalledWith( {
					to: '/sites/$siteSlug',
					params: { siteSlug: 'production-site' },
				} );
			} );

			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_hosting_configuration_staging_site_delete_success'
			);
		} );
	} );
} );
