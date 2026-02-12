/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../../../test-utils';
import PreferencesPrimarySite from '../index';
import type { Site, User } from '@automattic/api-core';
import type { DeepPartial } from 'utility-types';

const mockPrimarySiteId = 123;
const mockNewSiteId = 456;

jest.mock( '@wordpress/data', () => ( {
	useDispatch: jest.fn( () => ( {
		createSuccessNotice: jest.fn(),
		createErrorNotice: jest.fn(),
	} ) ),
	store: jest.fn(),
	combineReducers: jest.fn(),
	createReduxStore: jest.fn(),
	register: jest.fn(),
	createRegistry: jest.fn(),
	createSelector: jest.fn( ( selector ) => selector ),
	select: jest.fn(),
	dispatch: jest.fn(),
} ) );

jest.mock(
	'@automattic/api-queries',
	() => ( {
		userSettingsQuery: jest.fn( () => ( {
			queryKey: [ 'me', 'settings' ],
			queryFn: jest.fn(),
		} ) ),
		userSettingsMutation: jest.fn( () => ( {
			mutationFn: jest.fn(),
		} ) ),
	} ),
	{ virtual: true }
);

const mockSitesQuery = jest.fn();

jest.mock( '../../../app/context', () => ( {
	...jest.requireActual( '../../../app/context' ),
	useAppContext: jest.fn( () => ( {
		queries: {
			sitesQuery: () => mockSitesQuery(),
		},
	} ) ),
} ) );

const mockSites: DeepPartial< Site >[] = [
	{
		ID: mockPrimarySiteId,
		name: 'Test Site 1',
		URL: 'https://testsite1.com',
		site_migration: {
			migration_status: '',
		},
	},
	{
		ID: mockNewSiteId,
		name: 'Test Site 2',
		URL: 'https://testsite2.com',
		site_migration: {
			migration_status: '',
		},
	},
];

function renderPreferencesPrimarySite() {
	const { userSettingsQuery } = require( '@automattic/api-queries' );

	// Mock userSettingsQuery to return the API response
	userSettingsQuery.mockReturnValue( {
		queryKey: [ 'me', 'settings' ],
		queryFn: () =>
			Promise.resolve( {
				primary_site_ID: mockPrimarySiteId,
			} ),
	} );

	// Mock sitesQuery to return the sites
	mockSitesQuery.mockReturnValue( {
		queryKey: [ 'sites' ],
		queryFn: () => Promise.resolve( mockSites ),
	} );

	return render( <PreferencesPrimarySite />, {
		user: { visible_site_count: 2 } as User,
	} );
}

afterEach( () => {
	jest.clearAllMocks();
	mockSitesQuery.mockClear();
} );

test( 'save button is disabled when form is not dirty', async () => {
	renderPreferencesPrimarySite();

	const saveButton = await screen.findByRole( 'button', { name: 'Save' } );
	expect( saveButton ).toBeDisabled();
} );

test( 'hides primary site selector when user has no sites', async () => {
	const { userSettingsQuery } = require( '@automattic/api-queries' );

	userSettingsQuery.mockReturnValue( {
		queryKey: [ 'me', 'settings' ],
		queryFn: () =>
			Promise.resolve( {
				primary_site_ID: null,
			} ),
	} );

	mockSitesQuery.mockReturnValue( {
		queryKey: [ 'sites' ],
		queryFn: () => Promise.resolve( [] ),
	} );

	render( <PreferencesPrimarySite />, {
		user: { visible_site_count: 0 } as User,
	} );

	// Wait for component to render
	await waitFor( () => {
		expect( screen.queryByLabelText( 'Primary site' ) ).not.toBeInTheDocument();
	} );
} );
