/**
 * @jest-environment jsdom
 */
import { waitFor } from '@testing-library/react';
import wpcom from 'calypso/lib/wp';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SectionMigrate } from '../section-migrate';

jest.mock( 'calypso/lib/wp', () => ( { req: { get: jest.fn(), post: jest.fn() } } ) );
jest.mock( 'calypso/components/data/document-head', () => () => null );

describe( 'SectionMigrate', () => {
	const originalLocation = Object.getOwnPropertyDescriptor( window, 'location' );
	let locationReplace;

	beforeEach( () => {
		locationReplace = jest.fn();
		Object.defineProperty( window, 'location', {
			configurable: true,
			writable: true,
			value: { replace: locationReplace },
		} );
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', originalLocation );
	} );

	it( 'sends a site with no migration to the site migration flow', async () => {
		wpcom.req.get.mockResolvedValue( { status: 'inactive' } );

		renderWithProvider(
			<SectionMigrate
				targetSiteId={ 123 }
				targetSiteSlug="example.com"
				translate={ ( text ) => text }
				updateSiteMigrationMeta={ jest.fn() }
				requestSite={ jest.fn() }
			/>
		);

		await waitFor( () =>
			expect( locationReplace ).toHaveBeenCalledWith( '/setup/site-migration?siteSlug=example.com' )
		);
	} );
} );
