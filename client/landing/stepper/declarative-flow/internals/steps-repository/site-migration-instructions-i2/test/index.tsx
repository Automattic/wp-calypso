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
	ID: 123,
} );

const FROM_URL = 'some-source-site-url.example.com';
const getSupportMessage = () => screen.findByRole( 'link', { name: /Please, contact support/i } );

describe( 'SiteMigrationInstructions i2', () => {
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

	beforeEach( () => {
		nock.cleanAll();

		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/sites/123/atomic-migration-status/migrate-guru-key` )
			.once()
			.query( { http_envelope: 1 } )
			.reply( 200, { migration_key: 'some-migration-key' } );

		nock( 'https://public-api.wordpress.com:443' )
			.get( `/wpcom/v2/sites/123/atomic/transfers/latest` )
			.once()
			.reply( 200, { status: 'completed' } );

		nock( 'https://public-api.wordpress.com:443' )
			.get( `/rest/v1.2/sites/123/plugins?http_envelope=1` )
			.once()
			.reply( 200, {
				plugins: [ { name: 'migrate-guru/migrateguru', slug: 'migrate-guru', active: true } ],
			} );
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

		render();
		await userEvent.click(
			await screen.findByRole( 'button', { name: 'copy' }, { timeout: 4000 } )
		);

		expect( screen.getByText( 'copied!' ) ).toBeVisible();
		expect( document.execCommand ).toHaveBeenCalledWith( 'copy' );
	} );

	it( 'renders the migration key', async () => {
		render();

		await userEvent.click( await screen.findByRole( 'button', { name: 'Show key' } ) );

		expect( screen.getByDisplayValue( 'some-migration-key' ) ).toBeVisible();
	} );

	it( 'renders the fallback text when is not possible to get the migration key', async () => {
		nock.cleanAll();

		nock( 'https://public-api.wordpress.com:443' )
			.get( `/rest/v1.2/sites/123/plugins?http_envelope=1` )
			.once()
			.reply( 200, {
				plugins: [ { name: 'migrate-guru/migrateguru', slug: 'migrate-guru', active: true } ],
			} );

		nock( 'https://public-api.wordpress.com:443' )
			.get( `/wpcom/v2/sites/123/atomic/transfers/latest` )
			.once()
			.reply( 200, { status: 'completed' } );

		nock( 'https://public-api.wordpress.com' )
			.persist()
			.get( '/wpcom/v2/sites/123/atomic-migration-status/migrate-guru-key' )
			.reply( 500, new Error( 'Internal Server Error' ) );

		render();

		expect(
			await screen.findByText( /Migrate Guru page on the new WordPress.com/, undefined, {
				timeout: 3000,
			} )
		).toBeVisible();
	} );

	it( 'renders the support message when there is an error', async () => {
		nock.cleanAll();

		nock( 'https://public-api.wordpress.com:443' )
			.get( `/wpcom/v2/sites/123/atomic/transfers/latest` )
			.once()
			.reply( 200, { status: 'completed' } );

		nock( 'https://public-api.wordpress.com:443' )
			.persist()
			.get( `/rest/v1.2/sites/123/plugins?http_envelope=1` )
			.reply( 500, new Error( 'Fail to get the plugin list' ) );

		render();

		expect( await getSupportMessage() ).toBeVisible();
	} );
} );
