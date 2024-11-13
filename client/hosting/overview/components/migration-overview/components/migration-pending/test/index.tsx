/**
 * @jest-environment jsdom
 */

import { SiteDetails } from '@automattic/data-stores';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import React from 'react';
import { useSiteExcerptsQueryInvalidator } from 'calypso/data/sites/use-site-excerpts-query';
import { useDispatch } from 'calypso/state';
import { requestSite } from 'calypso/state/sites/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { MigrationPending } from '..';

const site = {
	ID: 123,
	slug: 'example.com',
} as SiteDetails;

jest.mock( 'calypso/state', () => ( {
	useDispatch: jest.fn(),
} ) );

jest.mock( 'calypso/state/sites/actions', () => ( {
	requestSite: jest.fn(),
} ) );

jest.mock( 'calypso/data/sites/use-site-excerpts-query', () => ( {
	useSiteExcerptsQueryInvalidator: jest.fn(),
} ) );

describe( 'MigrationPending', () => {
	beforeEach( () => {
		nock.disableNetConnect();
		jest.clearAllMocks();
	} );

	it( 'cancels the migration', async () => {
		const mockedDispatch = jest.fn();
		const invalidator = jest.fn();
		jest.mocked( useDispatch ).mockReturnValue( mockedDispatch );
		jest.mocked( useSiteExcerptsQueryInvalidator ).mockReturnValue( invalidator );
		renderWithProvider( <MigrationPending site={ site } /> );

		nock( 'https://public-api.wordpress.com' )
			.delete( '/wpcom/v2/sites/123/site-migration-status-sticker' )
			.reply( 200 );

		await userEvent.click( screen.getByRole( 'button', { name: 'Cancel migration' } ) );

		await userEvent.click( screen.getByRole( 'button', { name: 'Cancel migration' } ) );

		await waitFor( () => {
			expect( requestSite ).toHaveBeenCalledWith( site.ID );
			expect( invalidator ).toHaveBeenCalled();
		} );
	} );

	it( 'skips the migration dialog', async () => {
		const mockedDispatch = jest.fn();
		jest.mocked( useDispatch ).mockReturnValue( mockedDispatch );
		renderWithProvider( <MigrationPending site={ site } /> );

		await userEvent.click( screen.getByRole( 'button', { name: 'Cancel migration' } ) );
		await userEvent.click( screen.getByRole( 'button', { name: "Don't cancel migration" } ) );

		await waitFor( () => {
			expect( requestSite ).not.toHaveBeenCalled();
		} );
	} );
} );
