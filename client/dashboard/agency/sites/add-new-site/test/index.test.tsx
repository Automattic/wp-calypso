/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import AddNewSite from '../index';
import type { Agency } from '@automattic/api-core';

const BASE = 'https://public-api.wordpress.com';
const AGENCY_ID = 123;

interface Options {
	agency?: Partial< Agency >;
	pendingSiteCount?: number;
	/** Overrides `pendingSiteCount` when the payload shape itself is the subject. */
	pendingSites?: unknown[];
	availableDevLicenses?: number;
}

function mockAgencyEndpoints( {
	agency = {},
	pendingSiteCount = 0,
	pendingSites = Array.from( { length: pendingSiteCount }, ( _, index ) => ( {
		id: index + 1,
		features: { wpcom_atomic: { state: 'pending', license_key: `key-${ index }` } },
	} ) ),
	availableDevLicenses = 5,
}: Options = {} ) {
	nock( BASE )
		.get( '/wpcom/v2/agency' )
		.query( true )
		.reply( 200, [ { id: AGENCY_ID, approval_status: 'approved', ...agency } ] );

	nock( BASE ).get( `/wpcom/v2/agency/${ AGENCY_ID }/sites/pending` ).reply( 200, pendingSites );

	nock( BASE )
		.get( '/wpcom/v2/jetpack-licensing/dev-licenses' )
		.query( true )
		.reply( 200, { licenses: [], available: availableDevLicenses } );

	const onSelectAction = jest.fn();
	render( <AddNewSite onSelectAction={ onSelectAction } /> );

	return { onSelectAction, availableDevLicenses };
}

/**
 * Renders the menu and waits for both counts to arrive. Every gate in the menu
 * reads from the agency, so asserting before the queries settle would test the
 * empty first paint instead.
 */
async function renderMenu( options: Options = {} ) {
	const { onSelectAction, availableDevLicenses } = mockAgencyEndpoints( options );

	await screen.findByText( `${ availableDevLicenses } of 5 free licenses available` );

	return { onSelectAction };
}

const devSiteButton = () => screen.getByRole( 'button', { name: 'Create a site now' } );

describe( 'agency AddNewSite', () => {
	test( 'renders every way to add a site', async () => {
		await renderMenu();

		expect( screen.getByRole( 'button', { name: /Via WordPress.com connection/ } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /Via the Automattic plugin/ } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /Via the Jetpack plugin/ } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /Pressable/ } ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /on WordPress.com/ } ) ).toBeVisible();
		expect( screen.getByText( 'Start building for free' ) ).toBeVisible();
	} );

	test( 'reports the action chosen for the entries that open a modal', async () => {
		const { onSelectAction } = await renderMenu();

		await userEvent.click( screen.getByRole( 'button', { name: /Via the Jetpack plugin/ } ) );

		expect( onSelectAction ).toHaveBeenCalledWith( 'jetpack-connection' );
	} );

	test( 'sends the WordPress.com entry to the setup queue once sites are waiting', async () => {
		await renderMenu( { pendingSiteCount: 2 } );

		expect( screen.getByText( '2 sites available' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: /on WordPress.com/ } ) ).toHaveAttribute(
			'href',
			expect.stringContaining( '/sites/need-setup' )
		);
	} );

	test( 'sends the WordPress.com entry to the marketplace when nothing is waiting', async () => {
		await renderMenu();

		expect( screen.queryByText( /sites? available/ ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'link', { name: /on WordPress.com/ } ) ).toHaveAttribute(
			'href',
			expect.stringContaining( '/marketplace/hosting/wpcom' )
		);
	} );

	test( 'sends an agency that bought Pressable directly to Pressable', async () => {
		await renderMenu( {
			agency: { third_party: { pressable: { pressable_id: 1, a4a_id: null } } },
		} );

		const pressable = screen.getByRole( 'link', { name: /Pressable/ } );
		expect( pressable ).toHaveAttribute( 'href', 'https://my.pressable.com/agency/auth' );
		expect( pressable ).toHaveAttribute( 'target', '_blank' );
	} );

	test( 'sends an agency that bought Pressable through the marketplace back to it', async () => {
		await renderMenu( {
			agency: { third_party: { pressable: { pressable_id: 1, a4a_id: 'a4a-1' } } },
		} );

		const pressable = screen.getByRole( 'link', { name: /Pressable/ } );
		expect( pressable ).toHaveAttribute(
			'href',
			expect.stringContaining( '/marketplace/hosting/pressable' )
		);
		expect( pressable ).not.toHaveAttribute( 'target' );
	} );

	test( 'offers a free development site while licenses remain', async () => {
		const { onSelectAction } = await renderMenu( { availableDevLicenses: 3 } );

		await userEvent.click( devSiteButton() );

		expect( onSelectAction ).toHaveBeenCalledWith( 'dev-site-configurations' );
	} );

	test( 'blocks the free development site once the licenses run out', async () => {
		await renderMenu( { availableDevLicenses: 0 } );

		expect( devSiteButton() ).toHaveAttribute( 'aria-disabled', 'true' );
	} );

	test( 'blocks the free development site until the agency is approved', async () => {
		await renderMenu( { agency: { approval_status: 'pending' } } );

		expect( devSiteButton() ).toHaveAttribute( 'aria-disabled', 'true' );
	} );

	test( 'treats an agency with an empty approval status as approved', async () => {
		await renderMenu( { agency: { approval_status: '' } } );

		expect( devSiteButton() ).not.toHaveAttribute( 'aria-disabled', 'true' );
	} );

	test( 'treats an agency with no approval status at all as approved', async () => {
		await renderMenu( { agency: { approval_status: undefined } } );

		expect( devSiteButton() ).not.toHaveAttribute( 'aria-disabled', 'true' );
	} );

	test( 'ignores a pending site the backend has not licensed yet', async () => {
		await renderMenu( { pendingSites: [ { id: 1, features: {} } ] } );

		expect( screen.queryByText( /sites? available/ ) ).not.toBeInTheDocument();
	} );

	// Nothing has resolved on the first paint, so this asserts the pre-settle state.
	test( 'holds the free development site back until the count arrives', () => {
		mockAgencyEndpoints();

		expect( screen.queryByText( /free licenses available/ ) ).not.toBeInTheDocument();
		expect( devSiteButton() ).toHaveAttribute( 'aria-disabled', 'true' );
	} );
} );
