/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import SiteActions from '../site-actions';
import type { Site } from '@automattic/api-core';

const site = {
	ID: 123,
	is_wpcom_atomic: true,
} as Site;

describe( 'SiteActions restoration help', () => {
	const setShowSupportDoc = jest.fn();

	beforeEach( () => {
		setShowSupportDoc.mockClear();
		Object.defineProperty( window, 'wp', {
			configurable: true,
			value: { data: { dispatch: () => ( { setShowSupportDoc } ) } },
		} );
	} );

	afterEach( () => {
		Reflect.deleteProperty( window, 'wp' );
	} );

	it( 'opens the restoration guide in Help Center without requesting a restore', async () => {
		const restore = nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/sites/123/hosting/restore-plan-software' )
			.reply( 200, {} );
		render( <SiteActions site={ site } /> );
		const link = await screen.findByRole( 'link', { name: 'Learn more' } );

		expect( link ).toHaveAttribute(
			'href',
			'https://wordpress.com/support/restore-default-plugins-and-themes/'
		);
		await userEvent.click( link );

		expect( setShowSupportDoc ).toHaveBeenCalledWith(
			'https://wordpress.com/support/restore-default-plugins-and-themes/',
			276526,
			undefined
		);
		expect( restore.isDone() ).toBe( false );
	} );

	it( 'still requests restoration for the selected site', async () => {
		const restore = nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/sites/123/hosting/restore-plan-software' )
			.reply( 200, {} );
		render( <SiteActions site={ site } /> );
		await userEvent.click( await screen.findByRole( 'button', { name: 'Restore' } ) );

		await waitFor( () => expect( restore.isDone() ).toBe( true ) );
		expect( setShowSupportDoc ).not.toHaveBeenCalled();
	} );

	it.each( [
		[ 'Simple', { ...site, is_wpcom_atomic: false } ],
		[ 'staging', { ...site, is_wpcom_staging_site: true } ],
	] )( 'does not show the restoration link on a %s site', async ( _, ineligibleSite ) => {
		render(
			<>
				<p>Site actions loaded</p>
				<SiteActions site={ ineligibleSite } />
			</>
		);

		await screen.findByText( 'Site actions loaded' );
		expect( screen.queryByRole( 'link', { name: 'Learn more' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Restore' } ) ).not.toBeInTheDocument();
	} );
} );
