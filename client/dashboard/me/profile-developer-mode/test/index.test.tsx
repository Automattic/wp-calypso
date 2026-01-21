/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import DeveloperModeSection from '../index';

// Mock WordPress notices
const mockCreateSuccessNotice = jest.fn();
const mockCreateErrorNotice = jest.fn();
jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		createSuccessNotice: mockCreateSuccessNotice,
		createErrorNotice: mockCreateErrorNotice,
	} ),
	combineReducers: jest.fn( ( reducers ) => reducers ),
	createReduxStore: jest.fn(),
	register: jest.fn(),
	createSelector: jest.fn(),
	useSelect: jest.fn(),
	dispatch: jest.fn(),
} ) );

describe( 'DeveloperModeSection', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		nock.cleanAll();
	} );

	describe( 'Basic rendering', () => {
		it( 'renders the developer mode card with title and toggle', async () => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/me/settings' )
				.reply( 200, { is_dev_account: false } );

			render( <DeveloperModeSection /> );

			await waitFor( () => {
				expect( screen.getByText( 'Developer mode' ) ).toBeInTheDocument();
			} );

			expect( screen.getByRole( 'checkbox' ) ).toBeInTheDocument();
			expect( screen.getByRole( 'checkbox' ) ).not.toBeChecked();
		} );

		it( 'shows toggle as checked when is_dev_account is true', async () => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/me/settings' )
				.reply( 200, { is_dev_account: true } );

			render( <DeveloperModeSection /> );

			await waitFor( () => {
				expect( screen.getByRole( 'checkbox' ) ).toBeChecked();
			} );
		} );
	} );

	describe( 'Toggle interactions', () => {
		it( 'enables developer mode and shows success notice', async () => {
			const user = userEvent.setup();

			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/me/settings' )
				.reply( 200, { is_dev_account: false } );

			const updateApi = nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.1/me/settings', { is_dev_account: true } )
				.reply( 200, { is_dev_account: true } );

			render( <DeveloperModeSection /> );

			await waitFor( () => {
				expect( screen.getByRole( 'checkbox' ) ).toBeInTheDocument();
			} );

			await user.click( screen.getByRole( 'checkbox' ) );

			await waitFor( () => {
				expect( updateApi.isDone() ).toBe( true );
			} );

			expect( mockCreateSuccessNotice ).toHaveBeenCalledWith(
				'Developer mode enabled.',
				expect.objectContaining( { type: 'snackbar' } )
			);
		} );

		it( 'disables developer mode and shows success notice', async () => {
			const user = userEvent.setup();

			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/me/settings' )
				.reply( 200, { is_dev_account: true } );

			const updateApi = nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.1/me/settings', { is_dev_account: false } )
				.reply( 200, { is_dev_account: false } );

			render( <DeveloperModeSection /> );

			await waitFor( () => {
				expect( screen.getByRole( 'checkbox' ) ).toBeChecked();
			} );

			await user.click( screen.getByRole( 'checkbox' ) );

			await waitFor( () => {
				expect( updateApi.isDone() ).toBe( true );
			} );

			expect( mockCreateSuccessNotice ).toHaveBeenCalledWith(
				'Developer mode disabled.',
				expect.objectContaining( { type: 'snackbar' } )
			);
		} );

		it( 'shows error notice when mutation fails', async () => {
			const user = userEvent.setup();

			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/me/settings' )
				.reply( 200, { is_dev_account: false } );

			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.1/me/settings' )
				.reply( 500, { error: 'Server error' } );

			render( <DeveloperModeSection /> );

			await waitFor( () => {
				expect( screen.getByRole( 'checkbox' ) ).toBeInTheDocument();
			} );

			await user.click( screen.getByRole( 'checkbox' ) );

			await waitFor( () => {
				expect( mockCreateErrorNotice ).toHaveBeenCalled();
			} );
		} );
	} );
} );
