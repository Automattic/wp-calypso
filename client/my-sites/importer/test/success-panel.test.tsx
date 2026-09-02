/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useActiveThemeQuery } from 'calypso/data/themes/use-active-theme-query';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import SuccessPanel from '../success-panel';
import type { SiteDetails } from '@automattic/data-stores';

jest.mock( '@automattic/calypso-router', () => jest.fn() );

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

// `resetImport` is dispatched on mount and calls the importer API; not under test here.
jest.mock( 'calypso/state/imports/actions', () => ( {
	resetImport: jest.fn( () => ( { type: 'TEST_RESET_IMPORT' } ) ),
} ) );

jest.mock( 'calypso/data/themes/use-active-theme-query', () => ( {
	useActiveThemeQuery: jest.fn(),
} ) );

const SITE_ID = 123;
const SITE_SLUG = 'example.wordpress.com';

const site = {
	ID: SITE_ID,
	slug: SITE_SLUG,
	title: 'Example Site',
} as SiteDetails;

const importerStatus = {
	importerId: 'test-importer-id',
	type: 'importer-type-wordpress',
};

const initialState = {
	currentUser: { id: 456 },
	sites: {
		items: {
			[ SITE_ID ]: {
				ID: SITE_ID,
				slug: SITE_SLUG,
				options: { admin_url: `https://${ SITE_SLUG }/wp-admin/` },
			},
		},
	},
};

function mockActiveTheme( isBlockTheme: boolean ) {
	( useActiveThemeQuery as jest.Mock ).mockReturnValue( {
		data: [ { is_block_theme: isBlockTheme } ],
		isLoading: false,
	} );
}

describe( 'SuccessPanel', () => {
	let assignMock: jest.Mock;
	let originalLocation: Location;

	beforeEach( () => {
		jest.clearAllMocks();
		originalLocation = window.location;
		assignMock = jest.fn();
		Object.defineProperty( window, 'location', {
			configurable: true,
			writable: true,
			value: { ...originalLocation, assign: assignMock },
		} );
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', {
			configurable: true,
			writable: true,
			value: originalLocation,
		} );
	} );

	it( 'routes "Customize site" to the Customizer for classic themes', async () => {
		const user = userEvent.setup();
		mockActiveTheme( false );

		renderWithProvider( <SuccessPanel site={ site } importerStatus={ importerStatus } />, {
			initialState,
		} );
		await user.click( screen.getByRole( 'button', { name: /Customize site/ } ) );

		expect( page ).toHaveBeenCalledWith( `/customize/${ SITE_SLUG }` );
		expect( assignMock ).not.toHaveBeenCalled();
	} );

	it( 'routes "Customize site" to the site editor for block themes', async () => {
		const user = userEvent.setup();
		mockActiveTheme( true );

		renderWithProvider( <SuccessPanel site={ site } importerStatus={ importerStatus } />, {
			initialState,
		} );
		await user.click( screen.getByRole( 'button', { name: /Customize site/ } ) );

		expect( assignMock ).toHaveBeenCalledWith(
			expect.stringContaining( `https://${ SITE_SLUG }/wp-admin/site-editor.php` )
		);
		expect( page ).not.toHaveBeenCalled();
	} );
} );
