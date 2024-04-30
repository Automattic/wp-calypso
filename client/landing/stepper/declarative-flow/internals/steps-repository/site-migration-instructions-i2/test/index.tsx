/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import React from 'react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import SiteMigrationInstructions from '..';
import { StepProps } from '../../../types';
import { mockStepProps, renderStep } from '../../test/helpers';

jest.mock( 'calypso/landing/stepper/hooks/use-site' );

( useSite as jest.Mock ).mockReturnValue( {
	ID: 'some-site-id',
} );

const FROM_URL = 'some-source-site-url.example.com';

describe( 'SiteMigrationInstructions', () => {
	const render = (
		props?: Partial< StepProps >,
		initialEntry = `/some-path?from=${ FROM_URL }`
	) => {
		const combinedProps = { ...mockStepProps( props ) };
		return renderStep( <SiteMigrationInstructions { ...combinedProps } />, {
			initialEntry,
		} );
	};

	beforeAll( () => {
		nock.disableNetConnect();
	} );

	it( 'renders a link to migrate guru source site', async () => {
		render();

		const link = await screen.findByRole( 'link', {
			name: /Migrate Guru page on your source site/,
		} );

		expect( link ).toHaveAttribute( 'href', `${ FROM_URL }/wp-admin/admin.php?page=migrateguru` );
	} );

	it( 'render link to the wordpress.org when the from is not available', async () => {
		render( {}, '/some-path' );

		const link = await screen.findByRole( 'link', {
			name: /Migrate Guru plugin/,
		} );

		expect( link ).toHaveAttribute( 'href', `https://wordpress.org/plugins/migrate-guru/` );
	} );

	it( 'render link to the wordpress.org when the from is empty', async () => {
		render( {}, '/some-path?from=' );

		const link = await screen.findByRole( 'link', {
			name: /Migrate Guru plugin/,
		} );

		expect( link ).toHaveAttribute( 'href', `https://wordpress.org/plugins/migrate-guru/` );
	} );

	it( 'copies the migration key', async () => {
		document.execCommand = jest.fn();
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/sites/some-site-id/atomic-migration-status/migrate-guru-key' )
			.query( { http_envelope: 1 } )
			.reply( 200, { migration_key: 'some-migration-key' } );

		render();
		await userEvent.click( await screen.findByRole( 'button', { name: 'copy' } ) );

		expect( screen.getByText( 'copied!' ) ).toBeVisible();
		expect( document.execCommand ).toHaveBeenCalledWith( 'copy' );
	} );

	it( 'renders the migration key', async () => {
		document.execCommand = jest.fn();
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/sites/some-site-id/atomic-migration-status/migrate-guru-key' )
			.query( { http_envelope: 1 } )
			.reply( 200, { migration_key: 'some-migration-key' } );

		render();

		await userEvent.click( await screen.findByRole( 'button', { name: 'Show key' } ) );

		expect( screen.getByDisplayValue( 'some-migration-key' ) ).toBeVisible();
	} );

	it( 'renders the fallback text', async () => {
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/sites/some-site-id/atomic-migration-status/migrate-guru-key' )
			.query( { http_envelope: 1 } )
			.reply( 500, new Error( 'Internal Server Error' ) );

		render();

		expect( await screen.findByText( /Migrate Guru page on the new WordPress.com/ ) ).toBeVisible();
	} );
} );
