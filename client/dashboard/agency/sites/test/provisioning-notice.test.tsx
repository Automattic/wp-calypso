/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import ProvisioningSiteNotices from '../provisioning-notice';
import { trackProvisioningSite, untrackProvisioningSite } from '../provisioning-sites';

const API = 'https://public-api.wordpress.com';

function mockAgencySites( sites: unknown[] ) {
	nock( API )
		.persist()
		.get( '/wpcom/v2/agency' )
		.reply( 200, [ { id: 1 } ] );
	nock( API ).persist().get( '/wpcom/v2/agency/1/sites' ).reply( 200, sites );
}

function provisionedSite( id: number, state: string ) {
	return { id, url: `site${ id }.wordpress.com`, features: { wpcom_atomic: { state } } };
}

describe( '<ProvisioningSiteNotices>', () => {
	afterEach( () => untrackProvisioningSite( 7 ) );

	test( 'says nothing when this browser started no sites', () => {
		mockAgencySites( [] );

		const { container } = render( <ProvisioningSiteNotices /> );

		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'reports a site that is still being created', async () => {
		mockAgencySites( [ provisionedSite( 7, 'provisioning' ) ] );
		trackProvisioningSite( 7 );

		render( <ProvisioningSiteNotices /> );

		expect( await screen.findByText( 'Setting up your new WordPress.com site' ) ).toBeVisible();
	} );

	test( 'links to the site once it reports ready', async () => {
		mockAgencySites( [ provisionedSite( 7, 'active' ) ] );
		trackProvisioningSite( 7 );

		render( <ProvisioningSiteNotices /> );

		expect( await screen.findByText( 'Your WordPress.com site is ready!' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Set up your site' } ) ).toHaveAttribute(
			'href',
			'https://site7.wordpress.com'
		);
	} );

	test( 'stops reporting a site once the notice is dismissed', async () => {
		mockAgencySites( [ provisionedSite( 7, 'active' ) ] );
		trackProvisioningSite( 7 );

		render( <ProvisioningSiteNotices /> );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Dismiss' } ) );

		expect( screen.queryByText( 'Your WordPress.com site is ready!' ) ).not.toBeInTheDocument();
	} );
} );
