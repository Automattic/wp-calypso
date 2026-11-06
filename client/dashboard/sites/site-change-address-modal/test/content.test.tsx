/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dispatch, select } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import nock from 'nock';
import { render } from '../../../test-utils';
import SiteChangeAddressContent from '../content';
import type { DomainSummary, Site } from '@automattic/api-core';

let mockHasEnTranslation = true;

jest.mock( '@automattic/i18n-utils', () => ( {
	...jest.requireActual( '@automattic/i18n-utils' ),
	useHasEnTranslation: () => () => mockHasEnTranslation,
} ) );

const SITE_ID = 1;

const site = {
	ID: SITE_ID,
	slug: 'test-site.wordpress.com',
} as Site;

const domain = {
	domain: 'test-site.wordpress.com',
	blog_id: SITE_ID,
	subtype: { id: 'default_address', label: 'Default Address' },
	tags: [],
} as unknown as DomainSummary;

function mockValidate( status: number, body: Record< string, unknown > = {} ) {
	return nock( 'https://public-api.wordpress.com' )
		.post( `/wpcom/v2/sites/${ SITE_ID }/site-address-change/validate` )
		.reply( status, body );
}

function renderContent() {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/all-domains' )
		.query( true )
		.reply( 200, { domains: [ domain ] } );

	return render(
		<SiteChangeAddressContent site={ site } domain={ domain } onClose={ jest.fn() } />
	);
}

async function submitAddress( value: string ) {
	const user = userEvent.setup();
	await user.type( screen.getByRole( 'textbox', { name: 'New site address' } ), value );
	await user.click( screen.getByRole( 'button', { name: 'Next' } ) );
	return user;
}

describe( '<SiteChangeAddressContent>', () => {
	beforeEach( () => {
		mockHasEnTranslation = true;
	} );

	test( 'suggests adding a custom domain when the site has none', async () => {
		renderContent();

		expect(
			await screen.findByText( /A custom domain is easier to share and remember/ )
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Add a custom domain' } ) ).toBeVisible();
	} );

	test( 'falls back to the previous custom domain suggestion until it is translated', async () => {
		mockHasEnTranslation = false;
		renderContent();

		expect( await screen.findByText( /Before changing site address, consider/ ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'adding a custom domain' } ) ).toBeVisible();
	} );

	afterEach( () => {
		select( noticesStore )
			.getNotices()
			.forEach( ( notice ) => dispatch( noticesStore ).removeNotice( notice.id ) );
	} );

	test( 'shows a server validation error on the field', async () => {
		mockValidate( 403, {
			code: 'invalid',
			message: 'Sorry, that site address is unavailable.',
		} );
		renderContent();

		await submitAddress( 'taken' );

		expect( await screen.findByText( 'Sorry, that site address is unavailable.' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Next' } ) ).toBeDisabled();
		expect( select( noticesStore ).getNotices() ).toEqual( [] );
	} );

	test( 'shows the field error when the form is submitted with Enter', async () => {
		mockValidate( 403, {
			code: 'invalid',
			message: 'Sorry, that site address is unavailable.',
		} );
		renderContent();

		const user = userEvent.setup();
		await user.type( screen.getByRole( 'textbox', { name: 'New site address' } ), 'taken{Enter}' );

		expect( await screen.findByText( 'Sorry, that site address is unavailable.' ) ).toBeVisible();
	} );

	test( 'shows HTML validation messages as plain text', async () => {
		mockValidate( 403, {
			code: 'invalid',
			message: 'Please <a href="https://example.com/help">choose another</a> address.',
		} );
		renderContent();

		await submitAddress( 'taken' );

		expect( await screen.findByText( 'Please choose another address.' ) ).toBeVisible();
	} );

	test( 'clears the field error once the address is edited', async () => {
		mockValidate( 403, {
			code: 'invalid',
			message: 'Sorry, that site address is unavailable.',
		} );
		renderContent();

		const user = await submitAddress( 'taken' );
		await screen.findByText( 'Sorry, that site address is unavailable.' );

		await user.type( screen.getByRole( 'textbox', { name: 'New site address' } ), '2' );

		expect(
			screen.queryByText( 'Sorry, that site address is unavailable.' )
		).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Next' } ) ).toBeEnabled();
	} );

	test( 'shows a snackbar instead of a field error when validation fails for another reason', async () => {
		mockValidate( 500, { code: 'unexpected', message: 'An unexpected error occurred.' } );
		renderContent();

		await submitAddress( 'newaddress' );

		await waitFor( () => {
			expect( select( noticesStore ).getNotices() ).toEqual( [
				expect.objectContaining( {
					content: 'An unexpected error occurred.',
					status: 'error',
				} ),
			] );
		} );
		expect( screen.queryByText( 'An unexpected error occurred.' ) ).not.toBeInTheDocument();
	} );

	test( 'moves to the confirm step once the address is valid', async () => {
		mockValidate( 200, { success: true } );
		renderContent();

		await submitAddress( 'newaddress' );

		expect( await screen.findByRole( 'button', { name: 'Confirm' } ) ).toBeVisible();
	} );
} );
